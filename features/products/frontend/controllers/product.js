'use strict';

let promise = require('arrowjs').Promise;

module.exports = function (controller, component, application) {

    let redis = application.redisClient;
    let adminPrefix = application.getConfig('admin_prefix') || 'admin';
    let redisPrefix = application.getConfig('redis_prefix') || 'arrowCMS_';
    let itemOfPage = application.getConfig('pagination').numberItem || 10;

    controller.list = function (req, res) {
        let page = req.params.page || 1;

        promise.all(
            [
                application.models.product.findAndCountAll({
                    limit: itemOfPage,
                    offset: (page - 1) * itemOfPage,
                    order: 'id DESC'
                }),
                application.models.product.findAll({
                    where: {
                        price_sale: {
                            $gt: 0
                        }
                    },
                    limit: 3,
                    order: 'id DESC'
                })
            ]
        ).then(function (results) {
                if (results[0]) {
                    let totalPage = Math.ceil(results[0].count / itemOfPage);
                    res.frontend.render('products', {
                        products: results[0].rows,
                        recommended: results[1],
                        totalPage: totalPage,
                        currentPage: page
                    })
                } else {
                    res.frontend.render404(req, res);
                }
            }).catch(function (err) {
                console.log(err);
                res.frontend.render('_404');
            });
    };

    controller.listByCategory = function (req, res) {
        let page = req.params.page || 1;
        let catid = req.params.catid || 0;
        promise.all(
            [
                application.models.product.findAndCountAll({
                    where: {
                        categories: {
                            $ilike: '%:' + catid + ':%',
                        }
                    },
                    limit: itemOfPage,
                    offset: (page - 1) * itemOfPage,
                    order: 'id DESC'
                }),
                application.models.product.findAll({
                    where: {
                        price_sale: {
                            $gt: 0
                        }
                    },
                    limit: 3,
                    order: 'id DESC'
                }),
                application.models.product_category.find({
                    where: {
                        id: catid
                    }
                })
            ]
        ).then(function (results) {
                if (results[0]) {
                    let totalPage = Math.ceil(results[0].count / itemOfPage);
                    res.frontend.render('products', {
                        products: results[0].rows,
                        recommended: results[1],
                        category: results[2],
                        totalPage: totalPage,
                        currentPage: page
                    })
                } else {
                    res.frontend.render('404');
                }
            }).catch(function (err) {
                res.frontend.models.render('404');
            });
    };

    controller.detail = function (req, res) {
        promise.all(
            [
                // Find post by id
                application.models.product.find({
                    include: [
                        {
                            model: application.models.user,
                            attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                        }
                    ],
                    where: {
                        id: req.params.pid
                    }
                }),
                // Find all categories
                application.models.product_category.findAndCountAll({
                    order: "id ASC"
                }),
                //recommended
                application.models.product.findAll({
                    where: {
                        price_sale: {
                            $gt: 0
                        }
                    },
                    limit: 3,
                    order: 'id DESC'
                })
            ]
        ).then(function (results) {
            if (results[0]) {
                let count_views = results[0].count_views;
                count_views = Number(count_views) + 1;

                application.models.product.update({
                    count_views: count_views
                }, {
                    where: {
                        id: results[0].id
                    }
                }).then(function (re) {
                    // Render view
                    let images = results[0].images.split(':::');
                    res.frontend.render('detail', {
                        item: results[0],
                        categories: results[1].rows,
                        recommended: results[2],
                        images: images
                    });
                })
            } else {
                // Redirect to 404 if post not exist
                res.frondend.render('404');
            }
        }).catch(function (err) {
            res.frondend.render('404');
        });
    };

    controller.view_cart = function (req, res) {
        let products_ids = [];
        if (req.session.cart) {
            products_ids = req.session.cart;
            // Find post by id
            application.models.product.findAll({
                where: {
                    id: {
                        in: products_ids
                    }
                }
            }).then(function (results) {
                res.frontend.render('cart', {cart_detail: results});
            }).catch(function (err) {
                res.frontend.render('cart');
            })
        } else {
            res.frontend.render('cart');
        }
    };

    controller.add_cart = function (req, res) {
        let sess = req.session;
        let products_ids = [];
        let exists = true;
        if (sess.cart) {
            products_ids = sess.cart;
            products_ids.forEach(function (value) {
                if (req.params.pid == value) {
                    exists = false;
                    return;
                }
            })
        }
        if (exists) {
            products_ids.push(req.params.pid);
            sess.cart = products_ids;
            res.send(products_ids);
        } else {
            res.send('exists');
        }
    };

    controller.delete_cart = function (req, res) {
        let ids = req.session.cart;
        let id = req.body.id;
        if (req.body.id) {
            //delete product of list
            for (var i = 0; i < ids.length; i++) {
                if (Number(ids[i]) === Number(id)) {
                    ids.splice(i, 1);
                }
            }
            res.send(true);
        } else {
            //delete all products in cart
            if (req.session.cart) {
                req.session.cart = null;
            }
            res.redirect('/');
        }
    };

    controller.submit_cart = function (req, res) {
        let form = req.body;
        let data = JSON.parse(form.products);
        form.products = data;
        application.models.order.create(form).then(function (result) {
            if (result) {
                req.session.cart = null;
                res.end('success');
            } else {
                res.end('fail');
            }

        }).catch(function (err) {
            console.log(err);
            res.end('fail');
        });
    };

    controller.search = function (req, res) {
        let page = req.query.page || 1;
        let strSearch = req.query['txt'] || '';
        application.models.product.findAndCountAll({
                where: ["\"title\" ILIKE '%" + strSearch + "%' OR \"desc\" ILIKE '%" + strSearch + "%' OR \"content\" ILIKE '%" + strSearch + "%'"],
                limit: itemOfPage,
                offset: (page - 1) * itemOfPage
            }
        ).then(function (results) {
            if (results) {
                let totalPage = Math.ceil(results.count / itemOfPage);
                res.frontend.render('products', {
                    products: results.rows,
                    category: {
                        name: 'Tìm kiếm theo : "' + strSearch + '"'
                    },
                    totalPage: totalPage,
                    currentPage: page,
                    routeSearch: '/products/search?txt=' + strSearch
                })
            } else {
                res.frontend.render('products', {
                    products: results.rows,
                    category: {
                        name: 'không tìm thấy "' + strSearch + '"'
                    }
                })
            }
        }).catch(function (err) {
            res.frontend.render('404');
        })
    }
};