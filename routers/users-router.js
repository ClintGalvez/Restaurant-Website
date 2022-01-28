/**
 * Name: Clint Galvez [SN: 101195386]
 * Date: 10 December 2021
 * Assignment: COMP 2406-B Assignment 4
 * Purpose: contains the functionality pertaining to the users route
*/

const express = require('express');
const router = express.Router();
const User = require("../models/UserModel");
const Order = require("../models/OrderModel");

const mongoose = require('mongoose');       // mongoose
// const { ObjectId } = require('mongodb');    // mongodb

// routes
router.get('/', getUsers, sendUsers);
router.param('userId', getUser);
router.get('/:userId', auth, sendUser);
router.post('/:userId', updateUser);

// functions

function getUsers(request, response, next)
{
    let query = User.find({privacy: false})
    .exec(function(err, users)
    {
        if (err)
        {
            return response.status(500).send('server failure');
        }

        let validUsers = [];
        users.forEach(user => {
            if (request.query.name != undefined) // check if any queries are given
            {
                if (user.username.includes(request.query.name) && user.privacy == false)
                {
                    validUsers.push(user);
                }
            }
            else
            {
                if (user.privacy == false)
                {
                    validUsers.push(user);
                }
            }
        });

        request.users = validUsers;
        next();
    });
}

function sendUsers(request, response)
{
    response.render('users', {users: request.users});
    return;
}



function getUser(request, response, next)
{
    const id = mongoose.Types.ObjectId(request.params.userId); // mongoose version
    // const id = ObjectId(request.params.userId);                // mongodb version

    let query = User.findOne({_id: id}, function(err, result)
    {
        if (err)
        {
            return response.status(500).send("Error searching through the database");
        }

        // check if a valid user was found
        if (result == null)
        {
            response.status(401).send("ERROR: Invalid user.");
            return;
        }

        request.user = result;
        next();
    });
}

function auth(request, response, next)
{
    if (request.user.privacy == true && request.user._id != request.session.userId)
    {
        response.status(403).send("Unauthorized");
        return;
    }

    next();
}

function sendUser(request, response)
{
    response.format({
        'text/html': () => {
            response.render('user', {user: request.user});
        },
        'application/json': () => {
            response.json(request.user);
        },
        'default' : () => { response.status(406).send('Not acceptable'); }
    });
}

function updateUser(request, response)
{
    /*
        QUESTION!!!

        Hello dear Marker,

        I have a question in regards to the two update methods below and was wondering 
        if you could answer it in the feedback. From what I understand updating a 
        document with save() is generally the right way since you get the "full 
        validation and middleware", whereas update() doesn't, allowing it to be more
        efficient when adding content to existing documents. So I was wondering if I
        should just use save() for everything, unless I know for certain that I'm updating
        an already existing document, in which case I would use update() instead right?

        Sources:
        - https://mongoosejs.com/docs/documents.html
        - https://stackoverflow.com/questions/22278761/mongoose-difference-between-save-and-using-update/22278847

        Much appreciated,
        
        Clint Galvez
    */
    
    // update method 1 (more efficient):
    // User.findOneAndUpdate({_id: request.session.userId}, {privacy: request.body.privacy}, function(err, result)
    // {
    //     if (err)
    //     {
    //         return response.status(500).send('Unable to update user');
    //     }

    //     // response.status(201).json({name: request.user.username, user: request.user});
    //     return;
    // });

    // update method 2 (safer and generally right way):
    request.user.privacy = request.body.privacy;
    request.user.save(function(err, result)
    {
        if (err)
        {
            return response.status(500).send('Unable to update user');
        }

        // response.status(201).json({name: request.user.username, user: request.user});
        return;
    })
}

// make file contents importable
module.exports = router;