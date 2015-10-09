'use strict';

let slug = require('slug');

let _module = new BackModule;
let route = 'products';

/**
 * List of categories
 */
_module.list = function (req, res) {
    //console.log('list category of product')
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/products/categories/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, route, '/admin/products/categories', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "name",
            header: __.t('all_table_column_name'),
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
            header: __.t('all_table_column_alias'),
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
    ]);
    __models.product_category.findAndCountAll({
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        console.log('then function : '+results);
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        _module.render(req, res, 'category/index', {
            title:'Danh mục sản phẩm',
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    })
    .catch(function (err) {
            console.log('findAndCountAll() : '+err);
        });
};

/**
 * Create a category
 */
_module.save = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;

    __models.product_category.create(data).then(function () {
        req.flash.success(__.t('m_blog_backend_category_flash_save_success'));
        res.redirect('/admin/products/categories');
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        res.redirect('/admin/products/categories');
    });
};

/**
 * Update a category
 */
_module.update = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;

    if (data.name == 'name') {
        data.name = data.value;
    }

    if (data.name == 'alias') {
        delete data['name'];
        data.alias = slug(data.value).toLowerCase();
    }

    __models.product_category.find({
        where: {
            id: req.params.catId
        }
    }).then(function (cat) {
        cat.updateAttributes(data)
    }).then(function () {
        let response = {
            type: 'success',
            message: __.t('m_blog_backend_category_update_success')
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

/**
 * Delete a category
 */
_module.delete = function (req, res, next) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    Promise.all([
        function () {
            let listId = req.param('ids').split(',');
            listId.forEach(function (id) {
                __models.post.findAll({
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
                                __models.product_category.find({
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
        __models.product_category.destroy({
            where: {
                id: {
                    'in': req.param('ids').split(',')
                }
            }
        })
    ]).then(function () {
        req.flash.success(__.t('m_blog_backend_category_flash_delete_success'));
        res.sendStatus(200);
    });
};

module.exports = _module;