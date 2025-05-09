Clone the repository or unzip the project folder:
git clone https://github.com/Sigurd-RW/Final-Website.git
or unzip FinalWebsite.zip

Navigate to the project directory:
cd FinalWebsite/Final

Install Dependencies:
npm install express 
npm install mysql2
npm install validator

To run the application, ensure your MySQL database is running and update the models/db.js file with your database credentials.

node server.js

and then in your browser http://localhost:5000


Project structure 
server.js – Main application file

models/db.js – Database connection setup

public/ – Static frontend files (HTML, CSS)

my-app/ – (Not used in current backend setup, may contain frontend experiments)

.replit – Configuration file for Replit hosting (optional)

package.json – Project metadata and dependencies


