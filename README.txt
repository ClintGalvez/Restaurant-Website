# COMP 2406 - Dave McKenney - Assignment 4

Name: Clint Galvez [SN: 101196386]
Date: 10 December 2021
Assignment: COMP 2406-B Assignment 4
Purpose: Develop a website using express and mongoose

**Note: when referring to terminal, it is assumed you are in the directory this README file is located**

## COMPILATION COMMAND

- enter `npm install` into the terminal to get the required modules

## LAUNCHING AND OPERATING INSTRUCTIONS

### INITIAL RUN

- create a folder named `database` in the current directory (ie. the assignment4 directory)
- on one terminal enter `mongod --dbpath="database"`
    - **Note: make sure to always have this terminal running when starting up and using the server** <-- might only be needed for the initial run actually
    - if you exit out of this terminal just simply open up a new terminal and enter `mongod --path="database"` again
- (optional) on a new terminal enter `mongo` to gain a mongo terminal
- on a new terminal run database-initializer.js using node.js to intialize the database
- Run server.js using node.js
- Request `http://localhost:3000/` on a browser tab to go to the home page

### SUBSEQUENT RUNS

- (optional) on a new terminal enter `mongo` to gain a mongo terminal
- (optional) on a new terminal run database-initializer.js using node.js to reset the database to its inital data
- Run server.js using node.js
- Request `http://localhost:3000/` on a browser tab to go to the home page

### MONGO TERMINAL COMMANDS

- setup a mongo terminal command by entering `mongo` into a terminal
- `show dbs` --> shows all the available databases
    - `use dbName` --> switches to the specified db name, in this case for this assignment you would enter `use a4`
        - `show collections` --> displays all the available collections in the database
        - there should only be the following collections in this database
            - orders
            - sessions
            - users
        - **Note: after running database-initializer.js only the users collection will be seen, the other two will appear after running the server**
        - `db.collectionName.find()` --> displays all the documents of the collection, in this case collectionName would be replaced with 1 of the 3 previously listed collections

## DESIGN DECISIONS

- front end all mainly done by pug
- back end consists of only 4 javascript files (client, server, and router files)
    - client deals with the orderform page (ie. creating and submitting the order to the server)
    - the router files deal with requests pertaining to the /users and /orders routes (cleans up the code in the server file)
    - the server file only contains code for setting up and running the server and dealing with sessions
    - request handling was done in multiple steps using multiple functions (ie. router.post('/', createOrder, saveOrder, updateUserOrderHistory);)
        - this is to make changing the steps easier while not having to worry about breaking the following steps, as long as the required data is given to the function pertaining to the next step