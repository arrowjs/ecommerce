'use strict';

let _ = require('arrowjs')._;
let promise = require('arrowjs').Promise;
let slug = require('slug');
let formidable = require('formidable');
promise.promisifyAll(formidable);

let _log = require('arrowjs').logger;

module.exports = function (controller, component, application) {

    let redis = application.redisClient;
    let adminPrefix = application.getConfig('admin_prefix') || 'admin';
    let redisPrefix = application.getConfig('redis_prefix') || 'arrowCMS_';
    let itemOfPage = application.getConfig('pagination').numberItem || 10;
    let isAllow = ArrowHelper.isAllow;

    controller.categoryList = function (req, res) {
        let page = req.params.page || 1;

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton('/admin/products/categories');
        toolbar.addSearchButton(isAllow(req, 'index'));
        toolbar.addDeleteButton(isAllow(req, 'category_delete'));
        toolbar = toolbar.render();

        let tableStructure = [
            {
                column: "id",
                width: '1%',
                header: "",
                type: 'checkbox'
            },
            {
                column: "name",
                header: __('all_table_column_name'),
                width: '40%',
                link: '/admin/products/categories/{id}',
                acl: 'category_update',
                type: 'inline',
                pk: '{id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'alias',
                header: __('all_table_column_alias'),
                width: '40%',
                link: '/admin/products/categories/{id}',
                acl: 'category_update',
                type: 'inline',
                pk: '{id}'
            },
            {
                column: 'count',
                header: 'Sản phẩm',
                width: '19%'
            }
        ];

        // Config columns
        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: '/admin/products/categories/page/' + page + '/sort',
            limit: itemOfPage
        });

        application.models.product_category.findAndCountAll({
            where: filter.conditions,
            order: filter.order,
            limit: filter.limit,
            offset: filter.offset
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);
            res.backend.render('category/index', {
                title:'Danh mục sản phẩm',
                totalPage: totalPage,
                items: results.rows,
                currentPage: page,
                toolbar: toolbar
            });
        }).catch(function (err) {
                console.log('findAndCountAll() : '+err);
        });
    };

    controller.categorySave = function (req, res) {
        //res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
        let data = req.body;

        application.models.product_category.create(data).then(function () {
            req.flash.success(__('m_category_backend_category_flash_save_success'));
            res.redirect('/admin/products/categories');
        }).catch(function (err) {
            req.flash.error(err.name + ': ' + err.message);
            res.redirect('/admin/products/categories');
        });
    };

    controller.categoryUpdate = function (req, res) {
        //res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
        let data = req.body;

        if (data.name == 'name') {
            data.name = data.value;
        }

        if (data.name == 'alias') {
            delete data['name'];
            data.alias = slug(data.value).toLowerCase();
        }
        application.models.product_category.find({
            where: {
                id: req.params.catId
            }
        }).then(function (cat) {
            cat.updateAttributes(data)
        }).then(function () {
            let response = {
                type: 'success',
                message: __('m_blog_backend_category_update_success')
            };
            res.json(response);
        }).catch(function (err) {
            let response = {
                type: 'error',
                error: err.stack
            };
            res.json(response);
        });
    };

    controller.categoryDelete = function (req, res, next) {
        //res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
        promise.all([
            function () {
                let listId = req.body['ids'].split(',');
                listId.forEach(function (id) {
                    application.models.post.findAll({
                        where: ['cat_id like \'%:' + id + ':%\'']
                    }).then(function (posts) {
                        if (posts.length > 0) {
                            posts.forEach(function (post) {
                                let btag = post.cat_id;
                                // 0 ~ uncategorize
                                let newBtag = btag.replace(':' + id + ':', ':0:');
                                post.updateAttributes({
                                    cat_id: newBtag
                                }).on('success', function () {
                                    application.models.product_category.find({
                                        where: ['name=\'Uncategorized\'']
                                    }).then(function (tag) {
                                        let count = +tag.count + 1;
                                        tag.updateAttributes({
                                            count: count
                                        }).on('success', function () {
                                            //console.log(chalk.green('Update tag'+ tag.id + ': count success'));
                                        });
                                    })
                                });
                            });
                        }
                    })
                })
            },
            application.models.product_category.destroy({
                where: {
                    id: {
                        'in': req.body['ids'].split(',')
                    }
                }
            })
        ]).then(function () {
            req.flash.success(__('m_category_backend_category_flash_delete_success'));
            res.sendStatus(200);
        });
    }
};