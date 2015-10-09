'use strict';

let slug = require('slug');
let promise = require('bluebird');
let _module = new BackModule;
let route = 'blog';

/**
 * List of categories
 */
_module.list = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');

    // Config ordering
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/blog/categories/page/' + page + '/sort';

    // Config columns
    let filter = __.createFilter(req, res, route, '/admin/blog/categories', column, order, [
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
            link: '/admin/blog/categories/{id}',
            acl: 'update',
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
            link: '/admin/blog/categories/{id}',
            acl: 'update',
            type: 'inline',
            pk: '{id}'
        },
        {
            column: 'count',
            header: __.t('m_blog_backend_category_filter_column_post'),
            width: '19%'
        }
    ]);

    __models.category.findAndCountAll({
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        _module.render(req, res, 'category/index', {
            title: __.t("m_blog_backend_category_render_title"),
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Render view if has error
        _module.render(req, res, 'category/index', {
            title: __.t('m_blog_backend_category_render_title'),
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
};

/**
 * Create a category
 */
_module.save = function (req, res) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let data = req.body;
    data.name = data.name.trim();

    __models.category.create(data).then(function () {
        req.flash.success(__.t('m_blog_backend_category_flash_save_success'));
        res.redirect('/admin/blog/categories');
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        res.redirect('/admin/blog/categories');
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

    __models.category.find({
        where: {
            id: req.params.catId
        }
    }).then(function (cat) {
        return cat.updateAttributes(data)
    }).then(function () {
        let response = {
            type: 'success',
            message: __.t('m_blog_backend_category_update_success')
        };
        res.json(response);
    }).catch(function (err) {
        let response = {
            type: 'error',
            message: err.message
        };
        res.json(response);
    });
};

/**
 * Delete a category
 */
_module.delete = function (req, res, next) {
    res.locals.deleteButton = __acl.addButton(req, route, 'category_delete');
    let listId = req.param('ids').split(',');
    Promise.all([
        promise.map(listId, function (id) {
            return __models.post.findAndCountAll({
                where: {
                    categories: {
                        $like: '%:' + id + ':%'
                    }
                }
            }).then(function (posts) {
                if (posts.count > 0) {
                    // Update posts have tag is deleted category
                    return __models.category.find({
                        where: {
                            name: 'Uncategorized'
                        }
                    }).then(function (uncat) {
                        return promise.map(posts.rows, function (post) {
                            let btag = post.categories;
                            if(post.categories == (':' + id + ':')) {
                                let newBtag = btag.replace(':' + id + ':', ':' + uncat.id + ':');
                                return post.updateAttributes({
                                    categories: newBtag
                                }).then(function () {
                                    return uncat.updateAttributes({
                                        count: +uncat.count + 1
                                    })
                                });
                            } else {
                                return null;
                            }
                        })
                    })
                } else {
                    return null;
                }
            })
        }),
        __models.category.destroy({
            where: {
                id: {
                    'in': req.param('ids').split(',')
                }
            }
        })
    ]).then(function () {
        req.flash.success(__.t('m_blog_backend_category_flash_delete_success'));
        res.sendStatus(200);
    }).catch(function (err) {
        req.flash.error(err.name + ': ' + err.message);
        res.sendStatus(200);
    });
};

module.exports = _module;