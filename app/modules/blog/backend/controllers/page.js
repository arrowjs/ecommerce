'use strict';

let promise = require('bluebird');

let slug = require('slug');
let formidable = require('formidable');
//let sequelize = require('sequelize');
promise.promisifyAll(formidable);

let _module = new BackModule;
let route = 'blog';

_module.list = function (req, res) {
    // Add buttons
    res.locals.createButton = __acl.addButton(req, route, 'page_create', '/admin/blog/pages/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'created_by';
    let order = req.params.order || 'desc';
    res.locals.root_link = '/admin/blog/pages/page/' + page + '/sort';

    // Store search data to session
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_page_list'] = req.url;
    req.session.search = session_search;

    // Config columns
    let filter = __.createFilter(req, res, route, '/admin/blog/pages', column, order, [
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
            link: '/admin/blog/pages/{id}',
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
                filter_key: 'created_by'
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
    ], " AND type='page' ");

    // List pages
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
        _module.render(req, res, 'page/index', {
            title: __.t('m_blog_backend_page_render_title'),
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Render view if has error
        _module.render(req, res, 'page/index', {
            title: __.t('m_blog_backend_page_render_title'),
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
};

_module.listAll = function (req, res) {
    let query = req.param('query') || '';
    query = query.toLowerCase();

    __models.post.findAll({
        where: ["type='page' AND LOWER(title) like '%" + query + "%'"],
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

_module.redirectToView = function (req, res) {
    __models.post.find({
        where: {
            alias: req.params.name
        }
    }).then(function (page) {
        res.redirect('/admin/blog/pages/' + page.id);
    }).catch(function (err) {
        res.redirect('/404.html');
    })
};

_module.view = function (req, res) {
    // Add button
    let back_link = '/admin/blog/pages/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_page_list']) {
        back_link = '/admin' + search_params[route + '_page_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'page_index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    promise.all([
        __models.user.findAll({
            order: "id asc"
        }),
        __models.post.find({
            include: [__models.user],
            where: {
                id: req.params.cid,
                type: 'page'
            }
        })
    ]).then(function (results) {
        res.locals.viewButton = results[1].alias;
        _module.render(req, res, 'page/new', {
            title: __.t('m_blog_backend_page_render_update'),
            users: results[0],
            page: results[1]
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.update = function (req, res, next) {
    // Add button
    let back_link = '/admin/blog/pages/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_page_list']) {
        back_link = '/admin' + search_params[route + '_page_list'];
    }
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', back_link);
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    let data = req.body;
    if (!data.published) data.published = 0;
    data.modified_date = data.modified_date_gmt = Date.now();

    __models.post.find({
        include: [__models.user],
        where: {
            id: req.params.cid
        }
    }).then(function (page) {
        page.updateAttributes(data).then(function () {
            res.locals.viewButton = page.alias;
            req.messages = req.flash.success(__.t('m_blog_backend_page_flash_update_success'));
            _module.render(req, res, 'page/new', {
                title: __.t('m_blog_backend_page_render_update'),
                page: page
            });
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.create = function (req, res) {
    // Add button
    let back_link = '/admin/blog/pages/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_page_list']) {
        back_link = '/admin' + search_params[route + '_page_list'];
    }
    res.locals.saveButton = __acl.addButton(req, route, 'page_create');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', back_link);

    __models.user.findAll({
        order: "id asc"
    }).then(function (results) {
        _module.render(req, res, 'page/new', {
            title: __.t('m_blog_backend_page_render_create'),
            users: results
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.save = function (req, res) {
    // Add button
    let back_link = '/admin/blog/pages/page/1';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_page_list']) {
        back_link = '/admin' + search_params[route + '_page_list'];
    }
    res.locals.saveButton = __acl.addButton(req, route, 'page_edit');
    res.locals.backButton = __acl.addButton(req, route, 'page_index', back_link);
    res.locals.deleteButton = __acl.addButton(req, route, 'page_delete');

    let data = req.body;
    data.alias = slug(data.title).toLowerCase();
    data.created_by = req.user.id;
    data.type = 'page';
    if (!data.published) data.published = 0;

    __models.post.create(data).then(function (page) {
        req.flash.success(__.t('m_blog_backend_page_flash_create_success'));
        res.redirect('/admin/blog/pages/' + page.id);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.delete = function (req, res) {
    __models.post.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success(__.t('m_blog_backend_page_flash_delete_success'));
        res.send(200);
    });
};

module.exports = _module;