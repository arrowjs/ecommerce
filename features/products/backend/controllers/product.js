'use strict';

let _ = require('arrowjs')._;
let promise = require('arrowjs').Promise;
let slug = require('slug');
let formidable = require('formidable');
let fs = require('fs');
promise.promisifyAll(formidable);

let _log = require('arrowjs').logger;

module.exports = function (controller, component, application) {

    let redis = application.redisClient;
    let adminPrefix = application.getConfig('admin_prefix') || 'admin';
    let redisPrefix = application.getConfig('redis_prefix') || 'arrowCMS_';
    let itemOfPage = application.getConfig('pagination').numberItem || 10;
    let isAllow = ArrowHelper.isAllow;

    controller.productList = function (req, res) {
        let page = req.params.page || 1;

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton('/admin/products');
        toolbar.addSearchButton(isAllow(req, 'index'));
        toolbar.addCreateButton(isAllow(req, 'create'), '/admin/products/create');
        toolbar.addDeleteButton(isAllow(req, 'delete'));
        toolbar = toolbar.render();

        let tableStructure = [
            {
                column: "id",
                width: '1%',
                header: "",
                type: "checkbox"
            },
            {
                column: "title",
                width: '25%',
                header: 'Tiêu đề sản phẩm',
                link: '/admin/products/{id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'quantity',
                width: '10%',
                header: 'Số lượng',
                type: 'number',
                filter: {
                    data_type: 'integer',
                    filter_key : 'quantity'
                }
            },
            {
                column: 'price',
                width: '10%',
                header: 'Giá',
                type: 'integer',
                filter: {
                    type: 'integer',
                    filter_key: 'price'
                }
            },
            {
                column: 'price_sale',
                width: '10%',
                header: 'Khuyến mại',
                type: 'integer',
                filter: {
                    type: 'integer',
                    filter_key: 'price_sale'
                }
            },
            {
                column: 'status',
                width: '10%',
                header: 'Tình trạng',
                type: 'custom',
                alias: {
                    "1": "Cũ",
                    "0": "Mới"
                },
                filter: {
                    type: 'select',
                    filter_key: 'status',
                    data_source: [
                        {
                            name: 'Cũ',
                            value: 1
                        },
                        {
                            name: 'Mới',
                            value: 0
                        }
                    ],
                    display_key: 'name',
                    value_key: 'value'
                }
            }
        ];

        // Config columns
        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: '/admin/products/page/' + page + '/sort',
            limit: itemOfPage
        });

        // List products
        application.models.product.findAndCountAll({
            include: [
                {
                    model: application.models.user,
                    attributes: ['display_name'],
                    where: ['1 = 1']

                }
            ],
            order: filter.order,
            limit: filter.limit,
            offset: filter.offset,
            where: filter.conditions
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);

            res.backend.render('product/index', {
                title: 'Danh sách sản phẩm',
                items: results.rows,
                totalPage: totalPage,
                currentPage: page,
                toolbar: toolbar
            });
        }).catch(function (error) {
            _log.error(error);
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.backend.render('product/index', {
                title: 'Danh sách sản phẩm',
                totalPage: 1,
                items: null,
                currentPage
            });
        });
    };

    controller.productDelete = function (req, res) {
        application.models.product.findAll({
            where: {
                id: {
                    in: req.body['ids'].split(',')
                }
            }
        }).then(function (products) {
            products.forEach(function (product) {
                let tag = product.categories;
                if (tag != null && tag != '') {
                    tag = tag.split(':');
                    tag.shift();
                    tag.pop(tag.length - 1);

                    if (tag.length > 0) {
                        tag.forEach(function (id) {
                            application.models.product_category.findById(id).then(function (cat) {
                                let count = +cat.count - 1;
                                cat.updateAttributes({
                                    count: count
                                });
                            });
                        });
                    }
                }

                application.models.product.destroy({
                    where: {
                        id: product.id
                    }
                }).catch(function (err) {
                    req.flash.error('Product id: ' + post.id + ' | ' + err.name + ' : ' + err.message);
                });
            });
            req.flash.success('Xóa sản phẩm thành công');
            res.sendStatus(200);
        });
    };

    controller.productCreate = function (req, res) {

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton('/admin/products');
        toolbar.addSaveButton(isAllow(req, 'create'), '/admin/products');
        toolbar = toolbar.render();

        promise.all([
            application.models.product_category.findAll({
                order: "id asc"
            })
        ]).then(function (results) {
            res.backend.render('product/new', {
                categories: results[0],
                toolbar: toolbar,
                title: 'Thêm mới sản phẩm'
            })
        }).catch(function (err) {

        })
    };

    controller.productView = function (req, res) {

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton('/admin/products');
        toolbar.addSaveButton(isAllow(req, 'edit'));
        toolbar = toolbar.render();

        promise.all([
            application.models.product_category.findAll({
                order: "id asc"
            }),
            application.models.user.findAll({
                order: "id asc"
            }),
            application.models.product.find({
                include: [application.models.user],
                where: {
                    id: req.params.pid
                }
            })
        ]).then(function (results) {
            let data = results[2];
            let images = data.images.split(':::');
            if(images[0].length <= 0){
                images.splice(0,1);
            }
            //console.log(images);
            data.content = data.content.replace(/&lt/g, "&amp;lt");
            res.backend.render('product/new', {
                title : 'Cập nhật sản phẩm',
                categories : results[0],
                users: results[1],
                product: data,
                images : images,
                toolbar: toolbar
            });
        });
    };

    controller.productUpdate = function (req, res, next) {

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton('/admin/products');
        toolbar.addCreateButton(isAllow(req, 'create', '/admin/products/create'));
        toolbar.addSaveButton(isAllow(req, 'edit'));
        toolbar.addDeleteButton(isAllow(req, 'delete'));
        toolbar = toolbar.render();

        let data = req.body;
        data.categories = data.categories || "";
        application.models.product.findById(req.params.pid).then(function (product) {
            let tag = product.categories;
            if (tag != null && tag != '') {
                tag = tag.split(':');
                tag.shift();
                tag.pop(tag.length - 1);
            } else tag = [];
            let newtag = data.categories;
            if (newtag != null && newtag != '') {
                newtag = newtag.split(':');
                newtag.shift();
                newtag.pop(newtag.length - 1);
            } else newtag = [];

            /**
             * Update count for category
             */
            let onlyInA = [],
                onlyInB = [];

            if (Array.isArray(tag) && Array.isArray(newtag)) {
                onlyInA = tag.filter(function (current) {
                    return newtag.filter(function (current_b) {
                            return current_b == current
                        }).length == 0
                });
                onlyInB = newtag.filter(function (current) {
                    return tag.filter(function (current_a) {
                            return current_a == current
                        }).length == 0
                });
            }
            if (typeof Number(data.price_sale) != 'number')data.price_sale = 0;
            product.updateAttributes(data).then(function () {
                promise.all([
                    promise.map(onlyInA, function (id) {
                        return application.models.product_category.findById(id).then(function (tag) {
                            let count = tag.count - 1;
                            return tag.updateAttributes({
                                count: count
                            })
                        });
                    }),
                    promise.map(onlyInB, function (id) {
                        return application.models.product_category.findById(id).then(function (tag) {
                            let count =tag.count + 1;
                            return tag.updateAttributes({
                                count: count
                            })
                        });
                    })
                ]).then(function (data) {
                    req.flash.success('Cập nhật product thành công');
                    next();
                }).catch(function (err) {
                    req.flash.error('Cập nhật product không thành công');
                    next();
                })
            });
        });
    };

    controller.productSave = function (req, res) {
        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(isAllow(req, 'index'), '/products');
        toolbar.addSaveButton(isAllow(req, 'create'));
        toolbar = toolbar.render();

        //lay du lieu tu form
        let data = req.body;
        //set thêm một số trường
        data.created_by = req.user.id;

        //luu vao database
        application.models.product.create(data).then(function (product) {
            let tag = product.categories;
            if (tag != null && tag != '') {
                tag = tag.split(':');
                tag.shift();
                tag.pop(tag.length - 1);
                promise.map(tag, function (id) {
                    return application.models.product_category.findById(id).then(function (category) {
                        let count =category.count + 1;
                        return category.updateAttributes({
                            count: count
                        })
                    });
                });
            }
            req.flash.success('Tạo mới sản phẩm thành công !');
            res.redirect('/admin/products/' + product.id);
        }).catch(function (err) {
            req.flash.error(err.message);
            res.redirect('/admin/products/create');
        });
    };

    controller.productUploadImage = function (req, res) {
        let form = new formidable.IncomingForm();
        form.uploadDir = __base+'/upload/img/products/';
        form.keepExtensions = true;
        let path=__base+'/upload/img/';
        if (!fs.existsSync(form.uploadDir)) {
            fs.mkdirSync(form.uploadDir, function (err) {
                console.log(err);
                res.send('error');
            });
        }
        form.parse(req, function (err, fields, files) {
            if (!err){
                var newPath = form.uploadDir + files.image.name;
                newPath = newPath.replace(/ /g,'_').toLowerCase();
                fs.rename(files.image.path, newPath, function (err) {
                    if (err) {
                        res.end('cannot rename file ' + files.image.path);
                    }
                });
                res.send('/img/products/'+files.image.name.replace(/ /g,'_').toLowerCase());

            }
            else
                res.send('error');
        })
    };

    controller.productRead = function (req, res, next, id) {
        application.models.product.findById(id).then(function (product) {
            req.product = product;
            next();
        });
    };

    controller.productDeleteImage = function (req, res) {
        let id_ = req.body.id;
        let result={id : id_,action : false};
        //console.log(req.body.url);
        fs.unlink(__base+'/upload'+req.body.url, function(err) {
            if (err){
                res.send(result);
            }else{
                result.action = true;
                res.send(result);
            }
        })
    };
    /*
     * function to display all post which is choosed by user when create menus
     * return : json object contain
     totalRows: totalRows //number of posts
     totalPage: totalPage //number of page to display
     items: items //posts to display
     title_column: 'title',//title of column to display
     link_template: '/admin/blog/{id}/{alias}' //link of post add to menu
     * */
    controller.link_menu_products_category = function (req, res) {
        let page = req.query.page;
        let searchText = req.query.searchStr;

        let conditions = " 1=1 ";
        if (searchText != '') conditions += " AND name ilike '%" + searchText + "%'";

        // Find all posts with page and search keyword
        application.models.product_category.findAndCount({
            attributes: ['id', 'name', 'alias'],
            where: [conditions],
            limit: itemOfPage,
            offset: (page - 1) * itemOfPage,
            raw: true
        }).then(function (results) {
            let totalRows = results.count;
            let items = results.rows;
            let totalPage = Math.ceil(results.count / itemOfPage);

            // Send json response
            res.jsonp({
                totalRows: totalRows,
                totalPage: totalPage,
                items: items,
                title_column: 'name',
                link_template: '/products/{id}'
            });
        });
    },
    /*
     * function to display all post which is choosed by user when create menus
     * return : json object contain
     totalRows: totalRows //number of posts
     totalPage: totalPage //number of page to display
     items: items //posts to display
     title_column: 'title',//title of column to display
     link_template: '/admin/blog/{id}/{alias}' //link of post add to menu
     * */
    controller.link_menu_products = function (req, res) {
        console.log('link menu');
        let page = req.query.page;
        let searchText = req.query.searchStr;

        let conditions = " 1 = 1 ";
        if (searchText != '') conditions += " AND title ilike '%" + searchText + "%'";

        // Find all posts with page and search keyword
        application.models.product.findAndCount({
            attributes: ['id', 'title'],
            where: [conditions],
            limit: itemOfPage,
            offset: (page - 1) * itemOfPage,
            raw: true
        }).then(function (results) {
            console.log('dsadas : ',results);
            let totalRows = results.count;
            let items = results.rows;
            let totalPage = Math.ceil(results.count / itemOfPage);

            // Send json response
            res.jsonp({
                totalRows: totalRows,
                totalPage: totalPage,
                items: items,
                title_column: 'title',
                link_template: '/product/detail/{id}'
            });
        }).catch(function (err) {
            console.log(err);
        });
    }
};