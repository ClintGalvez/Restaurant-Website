/**
 * Name: Clint Galvez [SN: 101195386]
 * Date: 10 December 2021
 * Assignment: COMP 2406-B Assignment 4
 * Purpose: develop a server based restaurant website using a database
*/

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;
const User = require('./models/UserModel');

// importing routers
const usersRouter = require('./routers/users-router');
const ordersRouter = require('./routers/orders-router');
// const { request, response } = require('express'); // lines 20 and 21 were added automatically but still work after getting commented out
// const res = require('express/lib/response');

// global variables (was in the workshop but I never ended up needing this)
// app.locals.orders = {};
// app.locals.orderId = 0;

// session store setup
const store = new MongoDBStore({
    mongoUrl: 'mongodb://localhost/a4', // default port :27017 (ie. mongodb://localhost:27017/a4)
    collection: 'sessions'
});
store.on('error', (error) => { console.log(error); });

// middleware setup
app.set('views');                                   // MIDDLEWARE: Set the views folder
app.set('view engine', 'pug');                      // MIDDLEWARE: Set the view engine to pug
app.use(express.static("public")); 					// MIDDLEWARE: Serve all the files in the public folder
app.use(express.json()); 							// MIDDLEWARE: When 'Content-Type' is 'application/json', parse the JSON
app.use(express.urlencoded({ extended: true })); 	// MIDDLEWARE: When a form is sent, parse the form
app.use (
    session({
        name: 'a4-session',
        secret: "some secret key",
        cookie: {
            maxAge: 1000*60*60*24*7 // set cookie duration to a week
        },
        store: store,
        resave: true, // saves the session after every request and upates idle sessions to active (active sessions are not deleted)
        saveUninitialized: false, // stores the session if it hasn't been stored (empty sessions are not stored)
    })
);


// log requests received
app.use(function(request, response, next)
{
    console.log(`${request.method} for ${request.url}`);
    next();
});



// server routes
app.use(exposeSession);
app.get(['/','/home'], (request, response) => response.render('home'));

app.get('/login', (request, response) => response.render('login'));
app.post('/login', verify, login, createSession);
app.post('/register', verify, register, createSession);
app.get('/logout', logout);

app.get('/orderform', auth, (request, response) => response.render('orderform'));
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);


// functions

/**
 * exposes session to template engine
 */
function exposeSession(request, response, next)
{
    if (request.session)
    {
        response.locals.session = request.session;
    }

    next();
}



function verify(request, response, next)
{
    if (request.session.loggedin)
    {
        return response.status(200).send('Already logged in');
    }

    mongoose.connection.db.collection("users").findOne({username: request.body.username.toLowerCase()}, function(err, result)
    {
        if (err)
        {
            return response.status(500).send("Error searching through the database");
        }

        request.user = result;
        next();
    });
}

function login(request, response, next)
{
    // check if a valid user was found
    if (request.user == null)
    {
        response.status(401).send("ERROR: Invalid username.");
        return;
    }

    // check if the correct password was inputted
    if (!(request.user.password === request.body.password))
    {
        return response.status(401).send("ERROR: Invalid password.");
    }

    next();
}

function register(request, response, next)
{
    // check if username is already in use
    if (request.user != null)
    {
        return response.status(401).send("Username is already in use");
    }

    // create and add user to the database
    let user = new User();
    user.username = request.body.username;
    user.password = request.body.password;
    // user.privacy = false; // no longer needed since its set to false on default in the User schema
    request.user = user;
    user.save(function(err, result)
    {
        if (err)
        {
            throw err;
        }

        console.log(`User ${user.username} has been successfully saved`);

        next();
    });
}

function createSession(request, response)
{
    // server feedback on user login
    console.log("\nLogging in with credentials:");
    console.log(`Username: ${request.body.username}`);
    console.log(`Password: ${request.body.password}\n`);

    // setup session
    request.session.loggedin = true;
    request.session.username = request.user.username;
    request.session.userId = request.user._id;

    // make session data available to all view templates with response.locals
    // no need to pass the object when rendering anymore (cleaner code)
    response.locals.session = request.session; // might be a reference, rather than a copy => changes might... **not sure what it says in the workshop**
    // response.status(200).redirect(`/users/${request.user._id}`); // redirect will overwrite the res.locals (it causes a new re... **not sure what it says in the workshop**
    response.status(200).render('user', {user: request.user});
    return;
}

/**
 * log user out, delete session data
 */
function logout(request, response)
{
    request.session.destroy();
    delete response.locals.session;
    response.redirect('/home');
}

/**
 * authorize user to access route
 */
function auth(request, response, next)
{
    if (!request.session.loggedin)
    {
        return response.status(401).send('Unauthorized');
    }
    
    next();
}


// connect to database
mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'ERROR: unable to connect to database'));
db.once('open', function() 
{
	User.init(() => {
        startServer();
    });
});

/**
 * Helper function, reads restaurant json files and starts server once data is initialized
 */
function startServer()
{
    // READ JSON FILES
    // code goes here...
    // I was planning on having the restaurants saved on json files then read and saved on either the server or database, but then I got lazy lol

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}