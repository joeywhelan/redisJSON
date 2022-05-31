/**
 * @fileoverview Test client for shopping cart API
 * @author Joey Whelan <joey.whelan@gmail.com>
 */

import { RandomData } from './randomData.js';
import fetch from 'node-fetch';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SERVER = require('config').get('Server');
const AUTH = `Basic ${Buffer.from(SERVER.user + ':' + SERVER.password).toString('base64')}`;

async function createCart(dbType, cart) {
    const response = await fetch(`${SERVER.url}/${dbType}/cart`, {
        method: 'POST',
        body: JSON.stringify(cart),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function readCart(dbType, cartID) {
    const response = await fetch(`${SERVER.url}/${dbType}/cart/${cartID}`, {
        method: 'GET',
        headers: {
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function updateCart(dbType, cartID, item) {
    const response = await fetch(`${SERVER.url}/${dbType}/cart/${cartID}`, {
        method: 'PATCH',
        body: JSON.stringify(item),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function deleteCart(dbType, cartID) {
    const response = await fetch(`${SERVER.url}/${dbType}/cart/${cartID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function createProduct(dbType, product) {
    const response = await fetch(`${SERVER.url}/${dbType}/product`, {
        method: 'POST',
        body: JSON.stringify(product),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function readProduct(dbType, sku) {
    const response = await fetch(`${SERVER.url}/${dbType}/product/${sku}`, {
        method: 'GET',
        headers: {
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function updateProduct(dbType, sku, updates) {
    const response = await fetch(`${SERVER.url}/${dbType}/product/${sku}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function deleteProduct(dbType, sku) {
    const response = await fetch(`${SERVER.url}/${dbType}/product/${sku}`, {
        method: 'DELETE',
        headers: {
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function createUser(dbType, user) {
    const response = await fetch(`${SERVER.url}/${dbType}/user`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function readUser(dbType, userID) {
    const response = await fetch(`${SERVER.url}/${dbType}/user/${userID}`, {
        method: 'GET',
        headers: {
            'Authorization': AUTH
        }
    });
    return await response.json();
};

async function updateUser(dbType, userID, updates) {
    const response = await fetch(`${SERVER.url}/${dbType}/user/${userID}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function deleteUser(dbType, userID) {
    const response = await fetch(`${SERVER.url}/${dbType}/user/${userID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': AUTH
        }
    });
    return response.json();
};

async function redisTests() {
    let res;

    // Product Tests 
    //create
    const product = RandomData.generateProduct();
    res = await createProduct('redis', product);
    const sku = res.sku
    console.log(JSON.stringify(res, null, 4));
    //read
    res = await readProduct('redis', sku);
    console.log(JSON.stringify(res, null, 4));
    //update
    const updatedProd = {
        "description":  "Metal Spatula",
        "price":  50
    };
    res = await updateProduct('redis', sku, updatedProd);
    console.log(JSON.stringify(res, null, 4));
    //delete
    //res = await deleteProduct('redis', sku);
    //console.log(JSON.stringify(res, null, 4));


    // User Tests 
    //create
    const user = RandomData.generateUser();
    res = await createUser('redis', user);
    const userID = res.userID
    console.log(JSON.stringify(res, null, 4));
    //read
    res = await readUser('redis', userID);
    console.log(JSON.stringify(res, null, 4));
    //update
    const updatedUser = {
        "street":  "Random Street"
    };
    res = await updateUser('redis', userID, updatedUser);
    console.log(JSON.stringify(res, null, 4));
    //delete
    //res = await deleteUser('redis', userID);
    //console.log(JSON.stringify(res, null, 4));


    // Cart Tests 
    //create
    const cart = RandomData.generateCart(user, [product]);
    res = await createCart('redis', cart);
    const cartID = res.cartID
    console.log(JSON.stringify(res, null, 4));
    //read
    res = await readCart('redis', cartID);
    console.log(JSON.stringify(res, null, 4));
    //update
    const product2 = RandomData.generateProduct();
    const newItem = { "sku": product2.sku, "quantity": 1 };
    res = await updateCart('redis', cartID, newItem);
    console.log(JSON.stringify(res, null, 4));
    //delete
    //res = await deleteCart('redis', cartID);
    //console.log(JSON.stringify(res, null, 4));
}

(async () => {
    await redisTests();
})();