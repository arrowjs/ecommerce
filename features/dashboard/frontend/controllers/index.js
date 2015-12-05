'use strict';

let promise = require('arrowjs').Promise;

module.exports = function (controller, component, application) {
    // Get values config
    // see: CMS/config/
    //let redis = application.redisClient;
    //let adminPrefix = application.getConfig('admin_prefix') || 'admin';
    //let redisPrefix = application.getConfig('redis_prefix') || 'arrowCMS_';
    let itemOfPage = application.getConfig('pagination').numberItem || 10;

    // render homepage 'shop.arrowjs.com
    controller.index = function (req, res) {
        console.log('1');
        let totalPage = 1;
        let page = req.params.page || 1;
        promise.all(
            [
                // Find all product
                application.models.product.findAndCountAll({
                    include: [
                        {
                            model: application.models.user,
                            attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                        }
                    ],
                    offset: (page - 1) * itemOfPage,
                    limit: itemOfPage,
                    order: 'id DESC'
                }),
                application.models.product.findAll({
                    where: {
                        price_sale: {
                            $ne: 0
                        },
                        quantity: {
                            $gt: 0
                        }
                    },
                    limit: 3,
                    order: 'count_views DESC'
                }),
                // Find all product
                application.models.product.findAll({
                    limit: 4,
                    order: 'id ASC'
                }),
                // Find all product
                application.models.product.findAll({
                    where: {
                        status: 1
                    },
                    limit: 4,
                    order: 'id DESC'
                }),
                application.models.product.findAll({
                    where: {
                        status: 0
                    },
                    limit: 4,
                    order: 'id DESC'
                })

            ]
        ).then(function (results) {
                if (results) {
                    totalPage = Math.ceil(parseInt(results[0].count) / itemOfPage) || 1;
                    // Render view
                    res.frontend.render('index', {
                        products: results[0].rows,
                        slider: results[2],
                        recommended: results[1],
                        totalPage: totalPage,
                        currentPage: page,
                        olds: results[3],
                        news: results[4]
                    });
                } else {
                    // Redirect to 404 if post not exist
                    res.frontend.render('404');
                }
        }).catch(function (err) {
            console.log(err.stack),
                res.frontend.render('404');
        });
    };
};