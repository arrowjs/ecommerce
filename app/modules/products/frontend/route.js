/**
 * Created by thangnv on 8/5/15.
 */
'use strict';

module.exports = function (app) {

    let product = require('./controllers/product');
    app.route('/product/detail/:pid([0-9]+)').get(product.detail);
    //
    app.route('/products').get(product.list);
    app.route('/products/page/:page([0-9]+)').get(product.list);
    //
    app.route('/products/:catid([0-9]+)').get(product.listByCategory);
    app.route('/products/:catid([0-9]+)/page/:page([0-9]+)').get(product.listByCategory);
    app.route('/cart').get(product.view_cart);
    app.route('/cart/:pid([0-9]+)').get(product.add_cart);
    app.route('/cart/delete').get(product.delete_cart).post(product.delete_cart);
    app.post('/cart/submit',product.submit_cart);

    //
    app.route('/products/search').get(product.search);
};