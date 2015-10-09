/**
 * Created by thangnv on 7/28/15.
 */
'use strict';
let promise     = require('bluebird');
//let formidable  = require('formidable'),
//    fs          = require('fs');
let _module = new FrontModule();
let module_name = 'products';
let url = require('url');

_module.list = function (req, res) {
    let page = req.params.page || 1;
    promise.all(
        [
            __models.product.findAndCountAll({
            limit : __config.pagination.number_item,
            offset: (page - 1) * __config.pagination.number_item,
            order : 'id DESC'
        }),
            __models.product.findAll({
            where: {
                price_sale : {
                    $gt: 0
                }
            },
            limit : 3,
            order : 'id DESC'
        })
        ]
    ).then(function (results) {
            if(results[0]){
                let totalPage = Math.ceil(results[0].count / __config.pagination.number_item);
                _module.render(req,res,'products',{
                    products : results[0].rows,
                    recommended : results[1],
                    totalPage: totalPage,
                    currentPage: page
                })
            }else{
                _module.render404(req, res);
            }
    }).catch(function (err) {
            console.log(err);
        _module.render404(req, res);
    });

}
_module.listByCategory = function (req, res) {
    console.log('listByCategory');
    let page = req.params.page || 1;
    let catid = req.params.catid || 0;
    promise.all(
        [
            __models.product.findAndCountAll({
                where : {
                    categories : {
                        $ilike: '%:'+catid+':%',
                    }
                },
                limit : __config.pagination.number_item,
                offset: (page - 1) * __config.pagination.number_item,
                order : 'id DESC'
            }),
            __models.product.findAll({
                where: {
                    price_sale : {
                        $gt: 0
                    }
                },
                limit : 3,
                order : 'id DESC'
            }),
            __models.product_category.find({
                where: {
                    id : catid
                }
            })
        ]
    ).then(function (results) {
            if(results[0]){
                let totalPage = Math.ceil(results[0].count / __config.pagination.number_item);
                _module.render(req,res,'products',{
                    products : results[0].rows,
                    recommended : results[1],
                    category : results[2],
                    totalPage: totalPage,
                    currentPage: page
                })
            }else{
                _module.render404(req, res);
            }
        }).catch(function (err) {
            _module.render404(req, res);
        });
}
_module.detail = function (req,res) {
    console.log('detail');
    promise.all(
        [
            // Find post by id
            __models.product.find({
                include: [
                    {
                        model: __models.user,
                        attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                    }
                ],
                where: {
                    id: req.params.pid
                }
            }),
            // Find all categories
            __models.product_category.findAndCountAll({
                order: "id ASC"
            }),
            //recommended
            __models.product.findAll({
                where: {
                    price_sale : {
                            $gt: 0
                        }
                    },
                limit : 3,
                order : 'id DESC'
            })
        ]
    ).then(function (results) {
            if (results[0]) {
                let count_views = results[0].count_views;
                count_views = Number(count_views)+1;

                __models.product.update({
                    count_views : count_views
                },{
                    where : {
                        id : results[0].id
                    }
                }).then(function (re) {
                    // Render view
                    let images = results[0].images.split(':::');
                    _module.render(req, res, 'detail', {
                        item: results[0],
                        categories : results[1].rows,
                        recommended : results[2],
                        images:images
                    });
                })
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            _module.render404(req, res);
        });

}
_module.view_cart = function (req,res) {
    console.log('view_cart');
    let products_ids = [] ;
    if(req.session.cart){
        products_ids = req.session.cart;
                // Find post by id
        __models.product.findAll({
            where: {
                id : {
                    in : products_ids
                }
            }
        }).then(function (results) {
            _module.render(req,res,'cart',{cart_detail : results});
        }).catch(function (err) {
            _module.render(req,res,'cart');
        })
    }else{
        _module.render(req,res,'cart');
    }
}
_module.add_cart = function (req,res) {
    let sess = req.session;
    let products_ids = [] ;
    let exists = true;
    if(sess.cart){
        products_ids = sess.cart;
        products_ids.forEach(function (value) {
            if (req.params.pid == value){
                exists = false;
                return;
            }
        })
    }
    if (exists){
        products_ids.push(req.params.pid);
        sess.cart = products_ids;
        res.send(products_ids);
    }else{
        res.send('exists');
    }
}
_module.delete_cart = function (req,res) {
    let ids = req.session.cart;
    let id = req.body.id;
    if (req.body.id){
        //delete product of list
        for (var i = 0 ; i < ids.length ; i++){
            if (Number(ids[i]) === Number(id)){
                ids.splice(i,1);
            }
        }
        res.send(true);
    }else{
        //delete all products in cart
        if(req.session.cart){
            req.session.cart = null;
        }
        res.redirect('/');
    }
}
_module.submit_cart = function (req,res) {
    let form=req.body;
    //console.log(JSON.stringify(form));
    let data = JSON.parse(form.products);
    form.products = data;
    __models.order.create(form).then(function (result) {
        if (result){
            req.session.cart = null;
            res.end('success');
        }else{
            res.end('fail');
        }

    }).catch(function (err) {
        console.log(err);
        res.end('fail');
    });
}
_module.search = function (req,res) {
    let page = req.query.page || 1;
    let strSearch = req.query['txt'] || '';
    __models.product.findAndCountAll({
            where : ["\"title\" ILIKE '%"+strSearch+"%' OR \"desc\" ILIKE '%"+strSearch+"%' OR \"content\" ILIKE '%"+strSearch+"%'"],
            limit : __config.pagination.number_item,
            offset: (page - 1) * __config.pagination.number_item,
        }
    ).then(function(results){
        if (results){
            let totalPage = Math.ceil(results.count / __config.pagination.number_item);
            _module.render(req,res,'products',{
                products : results.rows,
                category : {
                    name : 'Tìm kiếm theo : "'+strSearch+'"'
                },
                totalPage: totalPage,
                currentPage: page,
                routeSearch : '/products/search?txt='+strSearch
            })
        }else{
            _module.render(req,res,'products',{
                products : results.rows,
                category : {
                    name : 'không tìm thấy "'+strSearch+'"'
                }
            })
        }
    }).catch(function (err) {
        _module.render404(req, res);
    })
}
module.exports = _module;