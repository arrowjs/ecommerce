'use strict';

module.exports = function (app) {
    // Root routing
    let post = require('./controllers/post');
    let page = require('./controllers/page');
    let category = require('./controllers/category');
    let archives = require('./controllers/archives');

    // Categories router
    app.route('/category/:alias([0-9a-zA-Z-]+)/:id([0-9]+)(/)?').get(category.listPostByCategory);
    app.route('/category/:alias([0-9a-zA-Z-]+)/:id([0-9]+)/page-:page([0-9]+)?(/)?').get(category.listPostByCategory);

    // Archive router
    app.route('/archives/:year([0-9]{4})/:month([0-9]{2})(/)?').get(archives.list);
    app.route('/archives/:year([0-9]{4})/:month([0-9]{2})/page-:page([0-9])(/)?').get(archives.list);

    // All Posts by author
    app.route('/posts/:author([0-9]+)(/)?').get(post.listByAuthor);
    app.route('/posts/:author/page-:page([0-9]+)?(/)?').get(post.listByAuthor);

    // All Posts
    app.route('/posts(/)?').get(post.listAll);
    app.route('/posts/page-:page([0-9]+)?(/)?').get(post.listAll);

    // Post router
    app.route('/posts/:id([0-9]+)/:alias([a-zA-Z0-9-]+)(/)?').get(post.index);

    // Page router
    app.route('/page/:alias([a-zA-Z0-9-]+)(/)?').get(page.index);
};