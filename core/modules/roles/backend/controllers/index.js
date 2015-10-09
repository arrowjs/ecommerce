'use strict';

let _ = require('lodash');
let fs = require('fs');
let path = require('path');

let _module = new BackModule;
let route = 'roles';

_module.list = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/roles/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    // Config ordering
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/roles/sort';

    // Store search data to session
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_index_list'] = req.url;
    req.session.search = session_search;

    // Config columns
    let filter = __.createFilter(req, res, route, '/admin/roles', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: "name",
            width: '25%',
            header: __.t('all_table_column_name'),
            link: '/admin/roles/{id}',
            acl: 'users.update',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "modified_at",
            type: 'datetime',
            width: '10%',
            header: __.t('m_roles_backend_controllers_index_filter_column_modified_at'),
            filter: {
                data_type: 'datetime'
            }
        },
        {
            column: "status",
            width: '15%',
            header: __.t('all_table_column_status'),
            filter: {
                type: 'select',
                filter_key: 'status',
                data_source: [
                    {
                        name: "publish"
                    },
                    {
                        name: "un-publish"
                    }
                ],
                display_key: 'name',
                value_key: 'name'
            }
        }
    ]);
    // List roles
    __models.role.findAll({
        where: filter.values,
        order: column + " " + order

    }).then(function (roles) {
        _module.render(req, res, 'index', {
            title: __.t('m_roles_backend_controllers_index_findAll_title'),
            items: roles
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'index', {
            title: __.t('m_roles_backend_controllers_index_findAll_title'),
            roles: null
        });
    });
};

_module.view = function (req, res) {
    // Add button
    let back_link = '/admin/roles';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'update');

    // Get role by id
    __models.role.find({
        where: {
            id: req.params.cid
        }
    }).then(function (roles) {
        _module.render(req, res, 'new', {
            title: __.t('m_roles_backend_controllers_index_view_title'),
            modules: __modules,
            role: roles,
            rules: JSON.parse(roles.rules)
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'new', {
            title: __.t('m_roles_backend_controllers_index_view_title'),
            modules: __modules,
            role: null,
            rules: null
        });
    });
};

_module.update = function (req, res) {
    let back_link = '/admin/roles';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }

    // Get role by id
    __models.role.find({
        where: {
            id: req.params.cid
        }
    }).then(function (role) {
        let rules = {};
        for (let k in req.body) {
            if (req.body.hasOwnProperty(k)) {
                if (k != 'title' && k != 'status' ) {
                    rules[k] = req.body[k].join(':');
                }
            }
        }

        // Update role
        return role.updateAttributes({
            name: req.body.title,
            status: req.body.status,
            rules: JSON.stringify(rules)
        });
    }).then(function () {
        req.flash.success(__.t('m_roles_backend_controllers_index_update_flash_success'));
        res.redirect(back_link);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.create = function (req, res) {
    // Add button
    let back_link = '/admin/roles';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'create');

    _module.render(req, res, 'new', {
        title: __.t('m_roles_backend_controllers_index_create_title'),
        modules: __modules
    });
};

_module.save = function (req, res) {
    let back_link = '/admin/roles';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }

    let rules = {};
    for (let k in req.body) {
        if (req.body.hasOwnProperty(k)) {
            if (k != 'title' && k != 'status') {
                rules[k] = req.body[k].join(':');
            }
        }
    }

    // Create role
    __models.role.create({
        name: req.body.title,
        status: req.body.status,
        rules: JSON.stringify(rules)
    }).then(function () {
        req.flash.success(__.t('m_roles_backend_controllers_index_create_save_flash_success'));
        res.redirect(back_link);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.redirect(back_link);
    });
};

_module.delete = function (req, res) {
    // Delete role
    __models.role.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success(__.t('m_roles_backend_controllers_index_delete_flash_success'));
        res.sendStatus(204);
    }).catch(function (error) {
        if (error.name == 'SequelizeForeignKeyConstraintError') {
            req.flash.error('m_roles_backend_controllers_index_delete_flash_error');
            res.sendStatus(200);
        } else {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.sendStatus(200);
        }
    });
};

module.exports = _module;