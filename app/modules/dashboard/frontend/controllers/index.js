'use strict';

let _module = new FrontModule;
let promise = require('bluebird');
_module.index = function (req, res) {

    _module.render(req, res, 'index', {
        user: req.user || null
    });
};
_module.list = function (req,res){
    let page = req.params.page || 1;
    let number_item = 12;
    let totalPage = 1;

    promise.all(
        [
            // Find all product
            __models.product.findAndCountAll({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                offset: (page - 1) * number_item,
                limit: number_item,
                order: 'id DESC'
            }),
            __models.product.findAll({
                where : {
                    price_sale : {
                        $ne : 0
                    },
                    quantity : {
                        $gt : 0
                    }
                },
                limit: 3,
                order: 'count_views DESC'
            }),
            // Find all product
            __models.product.findAll({
                limit: 4,
                order: 'id ASC'
            }),
            // Find all product
            __models.product.findAll({
                where : {
                  status : 1
                },
                limit: 4,
                order: 'id DESC'
            }),
            __models.product.findAll({
                where : {
                    status : 0
                },
                limit: 4,
                order: 'id DESC'
            })

        ]
    ).then(function (results) {
            if (results) {
                totalPage = Math.ceil(parseInt(results[0].count) / number_item) || 1;

                // Render view
                _module.render(req, res, 'index', {
                    products: results[0].rows,
                    slider : results[2],
                    recommended :  results[1],
                    totalPage: totalPage,
                    currentPage: page,
                    olds : results[3],
                    news : results[4]
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack),
            _module.render404(req, res);
        });
    //_module.render(req,res,'index',{
    //
    //});
}
module.exports = _module;