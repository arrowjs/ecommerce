'use strict';

let _ = require('lodash');
let promise = require('bluebird');

let _module = new BackModule;
let route = 'menus';
let redis = require("redis").createClient();

_module.index = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/menus/create');
    res.locals.deleteButton = __acl.addButton(req, route, 'delete');

    // Config ordering
    let column = req.params.sort || 'id';
    let order = req.params.order || '';
    res.locals.root_link = '/admin/menus/sort';

    // Store search data to session
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_index_index'] = req.url;
    req.session.search = session_search;

    // Config columns
    __.createFilter(req, res, '', '/admin/menus', column, order, [
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
            link: '/admin/menus/update/{id}',
            acl: 'users.update'
        }
    ]);

    __models.menus.findAll({
        order: column + " " + order,
        raw: true
    }).then(function (menus) {
        // Render view
        _module.render(req, res, 'index', {
            title: __.t('m_menus_backend_controller_index_render_title'),
            items: menus
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        // Render view if has error
        _module.render(req, res, 'index', {
            title: __.t('m_menus_backend_controller_index_render_title'),
            menus: null
        });
    });
};

_module.create = function (req, res) {
    // Add button
    let back_link = '/admin/menus';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_index']) {
        back_link = '/admin' + search_params[route + '_index_index'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'create');

    // Get module links
    res.locals.setting_menu_module = __setting_menu_module;

    // Render view
    _module.render(req, res, 'new', {
        title: __.t('m_menus_backend_controller_create_render_title')
    });
};

_module.save = function (req, res) {
    let menu_id = 0;

    // Create menu
    __models.menus.create({
        name: req.body.name,
        menu_order: req.body.output
    }).then(function (menu) {
        menu_id = menu.id;

        // Delete old menu detail
        return __models.menu_detail.destroy({
            where: {
                menu_id: menu_id
            }
        });
    }).then(function () {
        let promises = [];

        // Create menu detail
        for (let i in req.body.title) {
            promises.push(
                __models.menu_detail.create({
                    id: req.body.mn_id[i],
                    menu_id: menu_id,
                    name: req.body.title[i],
                    link: req.body.url[i],
                    attribute: req.body.attribute[i]
                })
            );
        }

        return promise.all(promises);
    }).then(function () {
        return _module.clearCache();
    }).then(function () {
        req.flash.success(__.t('m_menus_backend_controller_create_flash_success'));
        res.redirect('/admin/menus/update/' + menu_id);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);

        // Re-render view if has error
        _module.render(req, res, 'new');
    });
};

_module.read = function (req, res) {
    // Add button
    let back_link = '/admin/menus';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_index']) {
        back_link = '/admin' + search_params[route + '_index_index'];
    }

    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);

    // Get module links
    res.locals.setting_menu_module = __setting_menu_module;

    // Render view
    _module.render(req, res, 'new', {
        title: __.t('m_menus_backend_controller_read_render_title')
    });
};

_module.update = function (req, res) {
    // Find menu to update
    __models.menus.find({
        where: {
            id: req.params.cid
        }
    }).then(function (menu) {
        // Update menu
        return menu.updateAttributes({
            name: req.body.name,
            menu_order: req.body.output
        });
    }).then(function (menu) {
        // Delete old menu detail
        return __models.menu_detail.destroy({
            where: {
                menu_id: menu.id
            }
        });
    }).then(function () {
        let promises = [];

        // Create menu detail
        for (let i in req.body.title) {
            promises.push(
                __models.menu_detail.create({
                    id: req.body.mn_id[i],
                    menu_id: req.params.cid,
                    name: req.body.title[i],
                    link: req.body.url[i],
                    attribute: req.body.attribute[i]
                })
            );
        }

        return promise.all(promises);
    }).then(function () {
        return _module.clearCache();
    }).then(function () {
        req.flash.success(__.t('m_menus_backend_controller_update_flash_success'));
        res.redirect('/admin/menus/update/' + req.params.cid);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'new');
    });
};

_module.menuById = function (req, res, next, id) {
    __models.menus.findById(id).then(function (menu) {
        res.locals.menu = menu;
        return __models.menu_detail.findAll({
            where: {
                menu_id: id
            },
            raw: true
        });
    }).then(function (menu_details) {
        res.locals.menu_details = JSON.stringify(menu_details);
        next();
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        next();
    });
};

_module.sortAdminMenu = function (req, res) {
    res.locals.saveButton = __acl.addButton(req, route, 'update');
    _module.render(req, res, 'admin_sort', {
        title: __.t('m_menus_backend_controller_sort_admin_menu_render_title'),
        menus: __menus,
        messages: req.messages || []
    });
};

_module.saveSortAdminMenu = function (req, res) {
    let systems = req.body.s || [];
    let defaults = req.body.d || [];

    if (systems.length > 0) {
        __menus.sorting.systems = systems;
    }
    if (defaults.length > 0) {
        __menus.sorting.default = defaults;
    }

    redis.set(__config.redis_prefix + 'backend_menus', JSON.stringify(__menus), redis.print);
    res.sendStatus(200);
};

_module.delete = function (req, res) {
    __models.menus.destroy({
        where: {
            id: {
                "in": req.body.ids.split(',')
            }
        }
    }).then(function () {
        req.flash.success(__.t('m_menus_backend_controller_delete_flash_success'));
        res.sendStatus(204);
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        res.sendStatus(200);
    });
};

_module.menuitem = function (req, res) {
    _module.render(req, res, 'menuitem');
};

_module.clearCache = function () {
    return new Promise(function (fulfill, reject) {
        redis.keys(__config.redis_prefix + "sidebar:*", function (err, keys) {
            if (keys.length > 0) {
                redis.del(keys, function (err, result) {
                    if (err) reject(err);
                    fulfill(result);
                });
            } else {
                fulfill(null);
            }
        });
    });
};

module.exports = _module;
