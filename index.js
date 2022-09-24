/**
 * @fileoverview Shopping cart api implemented with RedisJSON
 * @author Joey Whelan <joey.whelan@gmail.com>
 */

'use strict'; 
import { createClient } from 'redis';
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const redisConfig = require('config').get('Redis');
const server = require('config').get('Server');
const basicAuth = require('express-basic-auth');

async function redisConnect() {
    const client = createClient({ 
        'url': `redis://${redisConfig.user}:${redisConfig.password}@${redisConfig.url}`
    });
    client.on('error', (err) => {
        throw new Error(err)
    });
    await client.connect();
    return client;
}

const app = express();
app.use(basicAuth({
    users: { [server.user] : server.password }
}));
app.use(express.json());

//Create cart ****
app.post('/:dbType/cart', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const val = await client.json.set(`cart:${req.body.cartID}`, '.', req.body);
                if (val == 'OK') {
                    console.log(`201: Cart ${req.body.cartID} added`);
                    res.status(201).json({'cartID': req.body.cartID});
                }
                else {
                    throw new Error(`Cart ${req.body.cartID} not added`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Read cart
app.get('/:dbType/cart/:cartID', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const cart = await client.json.get(`cart:${req.params.cartID}`, {path: '.'});
                if (cart) {
                    console.log(`200: Cart ${req.params.cartID} found`);
                    res.status(200).json(cart);
                }
                else {
                    throw new Error(`Cart ${req.params.cartID} not found`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Update cart with an item.  Quantity of existing item can be changed.  A change to 0 quantity equates to deletion of the item.
app.patch('/:dbType/cart/:cartID', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const updatedItem = req.body;
                const items = await client.json.get(`cart:${req.params.cartID}`, {path:'.items'}); 
                const newItems = [];
                let found = false
                for (let item of items) {
                    if (updatedItem.sku == item.sku) {
                        found = true;
                        if (updatedItem.quantity == 0) {
                            continue;
                        }
                        else {
                            newItems.push(updatedItem)
                        }
                        break;
                    }
                    else {
                        newItems.push(item);
                    }
                }
                if (!found) {
                    newItems.push(updatedItem)
                }           
                const val = await client.json.set(`cart:${req.params.cartID}`, `.items`, newItems);

                if (val == 'OK') {
                    console.log(`200: Cart ${req.params.cartID} updated`);
                    res.status(200).json({'cartID': req.params.cartID});
                }
                else {
                    throw new Error(`Cart ${req.params.sku} not fully updated`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Delete cart
app.delete('/:dbType/cart/:cartID', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const count = await client.json.del(`cart:${req.params.cartID}`);
                if (count > 0) {
                    console.log(`200: Cart ${req.params.cartID} deleted`);
                    res.status(200).json({'cartID': req.params.cartID});
                }
                else {
                    throw new Error(`Cart ${req.params.cartID} not found`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Create product
app.post('/:dbType/product', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const val = await client.json.set(`product:${req.body.sku}`, '.', req.body);
                if (val == 'OK') {
                    console.log(`201: Product ${req.body.sku} added`);
                    res.status(201).json({'sku': req.body.sku});
                }
                else {
                    throw new Error(`SKU ${req.body.sku} not added`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Read product
app.get('/:dbType/product/:sku', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const product = await client.json.get(`product:${req.params.sku}`, {path: '.'});
                if (product) {
                    console.log(`200: Product ${req.params.sku} found`);
                    res.status(200).json(product);
                }
                else {
                    throw new Error(`SKU ${req.params.sku} not found`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Update product.  Allows for partial updates.
app.patch('/:dbType/product/:sku', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const multi = await client.multi();
                const entries = Object.entries(req.body);
                for (const [field, value] of entries) {
                    await multi.json.set(`product:${req.params.sku}`, `.${field}`, value);
                }
                const results = await multi.exec();
                const check = (list) => list.every(item => item === 'OK');
                if (check(results)) {
                    console.log(`200: Product ${req.params.sku} updated`);
                    res.status(200).json({'sku': req.params.sku});
                }
                else {
                    throw new Error(`SKU ${req.params.sku} not fully updated`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Delete product
app.delete('/:dbType/product/:sku', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const count = await client.json.del(`product:${req.params.sku}`);
                if (count > 0) {
                    console.log(`200: Product ${req.params.sku} deleted`);
                    res.status(200).json({'sku': req.params.sku});
                }
                else {
                    throw new Error(`SKU ${req.params.sku} not found`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});


//Create user
app.post('/:dbType/user', async (req, res) => {
    try {
        const userID = req.body.userID;
        var client = await redisConnect();
        const val = await client.json.set(`user:${userID}`, '.', req.body);
        if (val == 'OK') {
            console.log(`201: User ${userID} added`);
            res.status(201).json({'userID': userID});
        }
        else {
            throw new Error(`User ${userID} not added`);
        }
    }
    catch (err) {
        console.error(`400: ${err.message}`);
        res.status(400).json({error: err.message});
    }
    finally {
        await client.quit();
    };
});


//Read user
app.get('/:dbType/user/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        var client = await redisConnect();
        const user = await client.json.get(`user:${userID}`, {path: '.'});
        if (user) {
            console.log(`200: User ${userID} found`);
            res.status(200).json(user);
        }
        else {
            throw new Error(`User ${userID} not found`);
        }
    }
    catch (err) {
        console.error(`400: ${err.message}`);
        res.status(400).json({error: err.message});
    }
    finally {
        await client.quit();
    };
});

//Update user.  Allows for partial updates.
app.patch('/:dbType/user/:userID', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const multi = await client.multi();
                const entries = Object.entries(req.body);
                for (const [field, value] of entries) {
                    await multi.json.set(`user:${req.params.userID}`, `.${field}`, value);
                }
                const results = await multi.exec();
                const check = (list) => list.every(item => item === 'OK');
                if (check(results)) {
                    console.log(`200: User ${req.params.userID} updated`);
                    res.status(200).json({'userID': req.params.userID});
                }
                else {
                    throw new Error(`User ${req.params.userID} not fully updated`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});

//Delete user
app.delete('/:dbType/user/:userID', async (req, res) => {
    switch (req.params.dbType) {
        case 'redis':
            try {
                var client = await redisConnect();
                const count = await client.json.del(`user:${req.params.userID}`);
                if (count > 0) {
                    console.log(`200: User ${req.params.userID} deleted`);
                    res.status(200).json({'userID': req.params.userID});
                }
                else {
                    throw new Error(`User ${req.params.userID} not found`);
                }
            }
            catch (err) {
                console.error(`400: ${err.message}`);
                res.status(400).json({error: err.message});
            }
            finally {
                await client.quit();
            };
            break;
        default:
            const msg = 'Unknown DB Type';
            console.error(`400: ${msg}`);
            res.status(400).json({error: msg});
            break;
    };
});


app.listen(8080, () => {
    console.log(`Server listening on port 8080`);
});
