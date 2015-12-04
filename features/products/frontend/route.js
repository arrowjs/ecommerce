'use strict';

module.exports = function (component) {
    let comp = component.controllers.frontend;

    return {

        // products
        "/products": {
            get: {
                handler: comp.list
            }
        },
        "/product/detail/:pid([0-9]+)": {
            get: {
                handler: comp.detail
            }
        },
        "/products/page/:page([0-9]+)": {
            get: {
                handler: comp.listByCategory
            }
        },
        "/products/:catid([0-9]+)": {
            get: {
                handler: comp.listByCategory
            }
        },
        "/products/:catid([0-9]+)/page/:page([0-9]+)'": {
            get: {
                handler: comp.listByCategory
            }
        },
        "/products/search": {
            get: {
                handler: comp.search
            }
        },

        // cart
        "/cart": {
            get: {
                handler: comp.view_cart
            }
        },
        "/cart/:pid([0-9]+)": {
            get: {
                handler: comp.add_cart
            }
        },
        "/cart/delete": {
            get: {
                handler: comp.delete_cart
            },
            post: {
                handler: comp.delete_cart
            }
        },
        "/cart/submit": {
            post: {
                handler: comp.submit_cart
            }
        }

    }
};