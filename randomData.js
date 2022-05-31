/**
 * @fileoverview Random data generator
 * @author Joey Whelan
 */
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { uniqueNamesGenerator, adjectives, colors, names } = require('unique-names-generator');

export class RandomData {
    
    static generateCart(user, products) {
        let items = [];
        for (let product of products) {
            items.push({
                "sku": product.sku,
                "quantity": RandomData.randomInt(1,10)
            });
        };
        
        return {
            "cartID": uuidv4(),
            "userID": user.userID,
            "items": items
        };
    };
    
    static generateProduct() {
       return {
                "sku": uuidv4(),
                "description": RandomData.#getProductDescription(),
                "price": RandomData.randomFloat(10,500)
        };
    };

    static generateUser() {
        return {
            "userID": uuidv4(),
            "lastName":  RandomData.#getLastName(),
            "firstName": RandomData.#getFirstName(),
            "street": RandomData.#getStreet(),
            "city": RandomData.#getCity(),
            "state": RandomData.#getState(),
            "zip": RandomData.#getZip()    
        };
    };

    static randomFloat(min, max) {
        return parseFloat((Math.random() * (max-min) + min).toFixed(2));
    };

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max-min) + min);
    };

    static #getFirstName() {
        return uniqueNamesGenerator({
            dictionaries:[names],
            length: 1
        });
    };

    static #getLastName() {
        return uniqueNamesGenerator({
            dictionaries: [adjectives],
            length: 1,
            style: 'capital'
        });
    };

    static #getCity() {
        return uniqueNamesGenerator({
            dictionaries: [adjectives],
            length: 1,
            style: 'capital'
        });
    };

    static #getProductDescription() {
        return uniqueNamesGenerator({
            dictionaries: [colors, adjectives],
            length: 2,
            style: 'capital',
            separator: ' '
        });
    };

    static #getState() {
        const states = [
            'CO',
            'WY',
            'MT',
            'ID',
            'OR'
        ];
        return uniqueNamesGenerator({
            dictionaries: [states],
            length: 1
        });
    };

    static #getStreet() {
        const streetTypes = [
            'Street',
            'Lane', 
            'Circle',
            'Avenue',
            'Place',
            'Boulevard'
        ];
        const streetAddr = uniqueNamesGenerator({
            dictionaries: [adjectives, streetTypes],
            length: 2,
            style: 'capital',
            separator: ' '
        });

        return `${RandomData.randomInt(100,999)} ${streetAddr}`
    };

    static #getZip() {
        return RandomData.randomInt(10000, 99999);
    };
};


/*
//test
( () => {
    const user = RandomData.generateUser();
    const product = RandomData.generateProduct();
    console.log(JSON.stringify(product, null, 4));
    const cart = RandomData.generateCart(user, [product])
    console.log(JSON.stringify(cart, null, 4));
})();
*/