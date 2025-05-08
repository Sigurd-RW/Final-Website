
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306
});

// Attempt to reconnect if connection is lost
function handleDisconnect() {
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to database:', error);
      // Try to reconnect in 5 seconds
      setTimeout(handleDisconnect, 5000);
    } else {
      console.log('Connected to MySQL database');
    }
  });

  connection.on('error', (error) => {
    console.error('Database error:', error);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw error;
    }
  });
}

handleDisconnect();

module.exports = connection;
