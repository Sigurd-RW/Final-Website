const mysql = require('mysql'); 





const connection = mysql.createConnection({

  host: process.env.DB_HOST, 

  user: process.env.DB_USER, 

  password: process.env.DB_PASS, 

  database: process.env.DB_NAME 

});





connection.connect((error) => {

  if (error) {

    console.error('Database connection failed:', error); 

    process.exit(1); 

  }

  console.log('Connected to the MySQL database.');
});



module.exports = connection;