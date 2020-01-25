let mysql = require("mysql");
let inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

// Creates the connection with the server and loads the product data upon a successful connection
connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
  }
  loadProducts();
});

function loadProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    console.table(res);

    promptCustomer(res);
  });
}

function promptCustomer(inventory) {
  inquirer.prompt([
    {
      type: "input",
      message: "What do you wanna buy? (Press 'q' to quit.)",
      name: "choice",
      validate: function(val){
          return !isNaN(val) || val.toLowerCase() === "q"
      }
    },

  ]).then(function(val){
    let choiceId = parseInt(val.choice);
    let product = checkInventory(choiceId, inventory);

    if (product) {
        quantityPrompt(product)
    }

  });
}

function checkInventory(choiceId, inventory) {
    for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];

        if (item.item_id === choiceId) {
            return item
        }    
    }

    return null
}

function quantityPrompt(product) {
    inquirer.prompt([
        {
            type: "input",
            message: "How many would you like to buy?",
            name: "quantity",
            validate: function(val){
                return !isNaN(val) || val.toLowerCase() === "q"
            }
        }
    ]).then(function(val) {
        let quantity = parseInt(val.quantity);

        if (quantity > product.stock_quantity) {
            console.log("No stock");

            loadProducts()
        } else {
            makePurchase(product, quantity);
        }
    })
}

function makePurchase(product, quantity) {
    connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?", [quantity, product.item_id], function(err, res) {
        if (err) throw err;

        console.log("Success! You purchased " + quantity + " " + product.product_name);

        loadProducts()
})}