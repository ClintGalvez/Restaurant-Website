/**
 * Name: Clint Galvez [SN: 101195386]
 * Date: 10 December 2021
 * Assignment: COMP 2406-B Assignment 4
 * Purpose: contains the functionality pertaining to the orders route
*/

const express = require('express');
const router = express.Router();
const User = require("../models/UserModel");
const Order = require("../models/OrderModel");

const mongoose = require('mongoose');       // mongoose
// const { ObjectId } = require('mongodb');    // mongodb


// routes
// router.get('/', getOrders, sendOrders);                             // display all order similar to /users <-- *Note: Dave said it's not needed*
router.post('/', createOrder, saveOrder, updateUserOrderHistory);   // save order
router.param('orderId', getOrder);
router.get('/:orderId', auth, sendOrder);


// functions
function getOrders(request, response, next)
{
    let query = Order.find()
    .exec(function(err, orders)
    {
        if (err)
        {
            return response.status(500).send('server failure');
        }

        User.find({privacy: false})
        .exec(function(err, customers)
        {
            if (err)
            {
                return response.status(500).send('server failure'); 
            }

            console.log(customers);
            let visibleOrders = [];
            orders.forEach(order => {
                const customerId = mongoose.Types.ObjectId(order.customerId); // mongoose version
                // const customerId = ObjectId(order.customerId);                // mongodb version
                
                // NOTE: the following doesnt work, its supposed to only add orders whose customers' private mode is on false to the visible orders array
                if (customers.filter(function(customer) { return customerId === customer._doc._id; }).length > 0) 
                {
                    visibleOrders.push(order);
                }

                visibleOrders.push(order);
            });
    
            request.orders = visibleOrders;
            next();
        });
    });
}

function sendOrders(request, response)
{
    response.render('orders', {orders: request.orders});
    return;
}



function createOrder(request, response, next)
{
    let order = new Order();
    
    order.restaurantId = request.body.restaurantID;
    order.restaurantName = request.body.restaurantName;
    order.order = request.body.order;
    order.subtotal = request.body.subtotal;
    order.fee = request.body.fee;
    order.tax = request.body.tax;
    order.total = request.body.total;
    order.customerId = request.session.userId;
    
    request.order = order;
    next();
}

function saveOrder(request, response, next)
{
    request.order.save(function(err, result)
    {
        if (err)
        {
            return response.status(500).send('Unable to save order');
        }

        response.status(200).send(`Successfully saved order #${request.order._id}`);
        next();
    });
}

function updateUserOrderHistory(request, response)
{
    User.findOne({_id: request.session.userId}, function(err, result)
    {
        if (err)
        {
            return response.status(500).send('server failure');
        }


        let orders = result.orders;
        if (orders === undefined)
        {
            orders = [request.order._id];
        }
        else
        {
            orders.push(request.order._id);
        }
        
        // update method 1 (more efficient):
        // User.findOneAndUpdate({_id: result._id}, {orders: orders}, function(err, result)
        // {
        //     if (err)
        //     {
        //         return response.status(500).send('Unable to update user');
        //     }

        //     // response.status(201).json({name: request.user.username, user: request.user}); // copied from users-router.js updateUser()
        //     return;
        // });
        
        // update method 2 (safer and generally right way):
        result.orders = orders;
        result.save(function(err, result)
        {
            if (err)
            {
                return response.status(500).send('Unable to update user');
            }

            // response.status(201).json({name: request.user.username, user: request.user}); // copied from users-router.js updateUser()
            return;
        });
    });
}


function getOrder(request, response, next)
{
    const id = mongoose.Types.ObjectId(request.params.orderId); // mongoose version
    // const id = ObjectId(request.params.orderId);                // mongodb version

    let query = Order.findOne({_id: id}, function(err, result)
    {
        if (err)
        {
            return response.status(500).send("Error searching through the database");
        }

        // check if a valid order was found
        if (result == null)
        {
            response.status(401).send("ERROR: Invalid order.");
            return;
        }
        
        request.order = result;
        next();
    });
}

function auth(request, response, next)
{
    let query = User.findOne({_id: request.order.customerId}, function(err, result)
    {
        if (err)
        {
            return response.status(500).send("Error searching through the database");
        }

        if (result == null)
        {
            response.status(401).send("ERROR: Invalid customer.");
            return;
        }

        if (result.privacy == true && result._id != request.session.userId)
        {
            response.status(403).send("Unauthorized");
            return;
        }

        next();
    });
}

function sendOrder(request, response)
{
    response.format({
        'text/html': () => {
            response.render('order', {order: request.order});
        },
        'application/json': () => {
            response.json(request.order);
        },
        'default' : () => { response.status(406).send('Not acceptable'); }
    });
}

// make file contents importable
module.exports = router;