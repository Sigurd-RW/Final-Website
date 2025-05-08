
const mysql = require('mysql');

let connection;

function createConnection() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
}

function handleDisconnect() {
  createConnection();
  
  connection.connect(function(err) {
    if(err) {
      console.log('Error when connecting to database:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    console.log('Database error:', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      console.error('Database error:', err);
    }
  });
}

handleDisconnect();

module.exports = connection;
