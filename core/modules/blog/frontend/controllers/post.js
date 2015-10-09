'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

var _module = new FrontModule;
_module.index = function (req, res) {
    promise.all(
        [
            // Find post by id
            __models.post.find({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                where: {
                    id: req.params.id,
                    type: 'post',
                    published: 1
                }
            }),
            // Find all categories
            __models.category.findAndCountAll({
                order: "id ASC"
            })
        ]
    ).then(function (results) {
            if (results[0]) {
                // Render view
                _module.render(req, res, 'post.html', {
                    item: results[0]
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack)
        });
};

_module.listAll = function (req, res) {
    let page = req.params.page || 1;
    let number_item = __config.pagination.number_item || 10;
    let totalPage = 1;

    promise.all(
        [
            // Find all post
            __models.post.findAndCountAll({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                where: {
                    type: 'post',
                    published: 1

                },
                offset: (page - 1) * number_item,
                limit: number_item,
                order: 'id DESC'
            })
        ]
    ).then(function (results) {
            if (results) {
                totalPage = Math.ceil(parseInt(results[0].count) / number_item) || 1;

                // Render view
                _module.render(req, res, 'category.html', {
                    posts: results[0].rows,
                    totalPage: totalPage,
                    currentPage: page,
                    baseURL: '/blogs/posts/page-'
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack)
        });
};

_module.listByAuthor = function (req, res) {
    let page = req.params.page || 1;
    let number_item = __config.pagination.number_item || 10;
    let totalPage = 1;

    promise.all(
        [
            // Find all post
            __models.post.findAndCountAll({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                where: {
                    type: 'post',
                    created_by: req.params.author,
                    published: 1

                },
                offset: (page - 1) * number_item,
                limit: number_item,
                order: 'id DESC'
            })
        ]
    ).then(function (results) {
            if (results) {
                totalPage = Math.ceil(parseInt(results[0].count) / number_item) || 1;

                // Render view
                _module.render(req, res, 'category.html', {
                    posts: results[0].rows,
                    totalPage: totalPage,
                    currentPage: page,
                    baseURL: '/blogs/posts/' + req.params.author + '/page-',
                    byAuthor: req.params.author
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack)
        });
};

module.exports = _module;