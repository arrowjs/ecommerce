'use strict';

let slug = require('slug');
let _ = require('lodash');
//let sequelize = require('sequelize');
let Promise = require('bluebird');

let _module = new BackModule;
let route = 'blog';
let edit_view = 'post/new';

_module.list = function (req, res) {
    // Add buttons
    res.locals.createButton = __acl.addButton(req, route, 'post_create', '/admin/blog/posts/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/blog/posts/page/' + page + '/sort';

    // Store search data to session
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_post_list'] = req.url;
    req.session.search = session_search;

    // Config columns
    let filter = __.createFilter(req, res, route, '/admin/blog/posts', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: 'title',
            width: '25%',
            header: __.t('all_table_column_title'),
            link: '/admin/blog/posts/{id}',
            acl: 'blog.post_edit',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'alias',
            width: '25%',
            header: __.t('all_table_column_alias'),
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'user.display_name',
            width: '20%',
            header: __.t('all_table_column_author'),
            filter: {
                data_type: 'string',
                filter_key: 'user.display_name'
            }
        },
        {
            column: 'created_at',
            width: '15%',
            header: __.t('m_blog_backend_page_filter_column_created_date'),
            type: 'datetime',
            filter: {
                data_type: 'datetime',
                filter_key: 'created_at'
            }
        },
        {
            column: 'published',
            width: '10%',
            header: __.t('all_table_column_status'),
            type: 'custom',
            alias: {
                "1": "Publish",
                "0": "Draft"
            },
            filter: {
                type: 'select',
                filter_key: 'published',
                data_source: [
                    {
                        name: 'Publish',
                        value: 1
                    },
                    {
                        name: 'Draft',
                        value: 0
                    }
                ],
                display_key: 'name',
                value_key: 'value'
            }
        }
    ], " AND type='post' ");

    // Find all posts
    __models.post.findAndCountAll({
        include: [
            {
                model: __models.user, attributes: ['display_name'],
                where: ['1 = 1']
            }
        ],
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);

        // Render view
        _module.render(req, res, 'post/index', {
            title: __.t('m_blog_backend_post_render_title'),
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Render view if has error
        _module.render(req, res, 'post/index', {
            title: __.t('m_blog_backend_post_render_title'),
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
};

_module.listAll = function (req, res) {
    let query = req.param('query') || "";
    query = query.toLowerCase();

    __models.post.findAll({
        where: ['LOWER(title) like \'%' + query + '%\' AND type=\'post\''],
        order: 'title asc'
    }).then(function (tags) {
        let data = [];
        if (tags.length > 0) {
            tags.forEach(function (t) {
                data.push({value: t.title, data: t.id});
            });
        }

        let result = {query: query, suggestions: data};
        res.json(result);
    });
};

_module.view = function (req, res) {
    // Add button
    let back_link = '/admin/blog/posts/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_post_list']) {
        back_link = '/admin' + search_params[route + '_post_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'post_index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'post_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    Promise.all([
        __models.category.findAll({
            order: "id asc"
        }),
        __models.user.findAll({
            order: "id asc"
        }),
        __models.post.find({
            include: [__models.user],
            where: {
                id: req.params.cid,
                type: 'post'
            }
        })
    ]).then(function (results) {
        res.locals.viewButton = 'posts/' + results[2].id + '/' + results[2].alias;

        let data = results[2];
        data.full_text = data.full_text.replace(/&lt/g, "&amp;lt");
        data.full_text = data.full_text.replace(/&gt/g, "&amp;gt");

        _module.render(req, res, edit_view, {
            title: __.t('m_blog_backend_post_render_update'),
            categories: results[0],
            users: results[1],
            post: data
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.update = function (req, res, next) {
    // Add button
    let back_link = '/admin/blog/posts/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_post_list']) {
        back_link = '/admin' + search_params[route + '_post_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'post_index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'post_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'post_delete');

    let data = req.body;
    data.categories = data.categories || "";
    data.author_visible = (data.author_visible != null);
    if (!data.published) data.published = 0;

    __models.post.findById(req.params.cid).then(function (post) {
        let tag = post.categories;
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

        if (data.published != post.published && data.published == 1) data.published_at = Date.now();

        return post.updateAttributes(data).then(function () {
            return Promise.all([
                Promise.map(onlyInA, function (id) {
                    return __models.category.findById(id).then(function (tag) {
                        let count = +tag.count - 1;
                        return tag.updateAttributes({
                            count: count
                        })
                    });
                }),
                Promise.map(onlyInB, function (id) {
                    return __models.category.findById(id).then(function (tag) {
                        let count = +tag.count + 1;
                        return tag.updateAttributes({
                            count: count
                        })
                    });
                })
            ])
        })
    }).then(function () {
        req.flash.success(__.t('m_blog_backend_post_flash_update_success'));
        next();
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.create = function (req, res) {
    // Add button
    let back_link = '/admin/blog/posts/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_post_list']) {
        back_link = '/admin' + search_params[route + '_post_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'post_index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'post_create');

    Promise.all([
        __models.category.findAll({
            order: "id asc"
        }),
        __models.user.findAll({
            order: "id asc"
        })
    ]).then(function (results) {
        _module.render(req, res, edit_view, {
            title: __.t('m_blog_backend_post_render_create'),
            categories: results[0],
            users: results[1]
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.save = function (req, res) {
    let data = req.body;
    data.created_by = req.user.id;
    if (data.alias == null || data.alias == '')
        data.alias = slug(data.title).toLowerCase();
    data.type = 'post';
    if (!data.published) data.published = 0;
    if (data.published == 1) data.published_at = Date.now();

    let post_id = 0;

    __models.post.create(data).then(function (post) {
        post_id = post.id;
        let tag = post.categories;

        if (tag != null && tag != '') {
            tag = tag.split(':');
            tag.shift();
            tag.pop(tag.length - 1);

            return Promise.map(tag, function (id) {
                return __models.category.findById(id).then(function (tag) {
                    let count = +tag.count + 1;
                    return tag.updateAttributes({
                        count: count
                    })
                });
            });
        }
    }).then(function () {
        req.flash.success(__.t('m_blog_backend_post_flash_create_success'));
        res.redirect('/admin/blog/posts/' + post_id);
    }).catch(function (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            req.flash.error("Alias was duplicated");
        } else {
            req.flash.error(err.message);
        }
        res.redirect('/admin/blog/posts/create');
    });
};

_module.delete = function (req, res) {
    __models.post.findAll({
        where: {
            id: {
                in: req.param('ids').split(',')
            }
        }
    }).then(function (posts) {
        Promise.map(posts, function (post) {
            let tag = post.categories;
            if (tag != null && tag != '') {
                tag = tag.split(':');
                tag.shift();
                tag.pop(tag.length - 1);

                if (tag.length > 0) {
                    tag.forEach(function (id) {
                        __models.category.findById(id).then(function (cat) {
                            let count = +cat.count - 1;
                            cat.updateAttributes({
                                count: count
                            });
                        });
                    });
                }
            }

            return __models.post.destroy({
                where: {
                    id: post.id
                }
            }).catch(function (err) {
                req.flash.error('Post id: ' + post.id + ' | ' + err.name + ' : ' + err.message);
            });
        });
    }).then(function () {
        req.flash.success(__.t('m_blog_backend_post_flash_delete_success'));
        res.sendStatus(200);
    });
};

_module.read = function (req, res, next, id) {
    __models.post.findById(id).then(function (post) {
        req.post = post;
        next();
    });
};

/**
 * Post authorization middleware
 */
_module.hasAuthorization = function (req, res, next) {
    return (req.post.created_by !== req.user.id);
};

module.exports = _module;