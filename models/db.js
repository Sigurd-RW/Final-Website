const mysql = require('mysql'); // Import the MySQL module



// Create a database connection using configuration details

const connection = mysql.createConnection({

  host: process.env.DB_HOST, // Host from FreeSQLDatabase (from .env file)

  user: process.env.DB_USER, // Database username

  password: process.env.DB_PASSWORD, // Database password

  database: process.env.DB_NAME // Database name

});



// Establish connection to the MySQL database

connection.connect((error) => {

  if (error) {

    console.error('Database connection failed:', error); // Log errors if connection fails

    process.exit(1); // Exit the app if the database connection fails

  }

  console.log('Connected to the MySQL database.'); // Success message

});



// Export the connection to be reused in other files

module.exports = connection;