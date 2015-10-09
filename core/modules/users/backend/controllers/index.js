'use strict';

let _ = require('lodash');
let fs = require('fs');
let redis = require('redis').createClient();
let path = require('path');
let slug = require('slug');
let promise = require('bluebird');
let writeFileAsync = promise.promisify(require('fs').writeFile);
let readdirAsync = promise.promisify(require('fs').readdir);
let formidable = require('formidable');
promise.promisifyAll(formidable);

let _module = new BackModule;
let edit_template = 'new.html';
let folder_upload = '/img/users/';
let route = 'users';

_module.list = function (req, res) {
    // Add button
    res.locals.createButton = __acl.addButton(req, route, 'create', '/admin/users/create');

    // Config ordering
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'asc';
    res.locals.root_link = '/admin/users/page/' + page + '/sort';

    // Store search data to session
    let session_search = {};
    if (req.session.search) {
        session_search = req.session.search;
    }
    session_search[route + '_index_list'] = req.url;
    req.session.search = session_search;

    // Config columns
    let filter = __.createFilter(req, res, route, '/admin/users', column, order, [
        {
            column: "id",
            width: '8%',
            header: "ID",
            filter: {
                model: 'user',
                data_type: 'number'
            }
        },
        {
            column: "display_name",
            width: '15%',
            header: __.t('m_users_backend_full_name'),
            link: '/admin/users/{id}',
            acl: 'users.update',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "user_login",
            width: '15%',
            header: __.t('m_users_backend_user_name'),
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "user_email",
            width: '15%',
            header: __.t('all_table_column_email'),
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "phone",
            width: '12%',
            header: __.t('all_table_column_phone'),
            filter: {
                data_type: 'string'
            }
        },
        {
            column: "role.name",
            width: '10%',
            header: __.t('all_table_column_role'),
            link: '/admin/roles/{role.id}',
            filter: {
                type: 'select',
                filter_key: 'role_id',
                data_source: 'arr_role',
                display_key: 'name',
                value_key: 'id'
            }
        },
        {
            column: "user_status",
            width: '10%',
            header: __.t('all_table_column_status'),
            filter: {
                type: 'select',
                filter_key: 'user_status',
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

    // List users
    __models.user.findAndCountAll({
        attributes: filter.attributes,
        include: [
            {
                model: __models.role
            }
        ],
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item,
        where: filter.values
    }).then(function (results) {
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);
        _module.render(req, res, 'index.html', {
            title: __.t('m_users_backend_controllers_index_list'),
            totalPage: totalPage,
            items: results.rows,
            currentPage: page

        });

    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, 'index.html', {
            title: __.t('m_users_backend_controllers_index_list'),
            totalPage: 1,
            users: null,
            currentPage: 1
        });
    });
};

_module.view = function (req, res) {
    // Add button
    let back_link = '/admin/users';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'create');

    // Get user by session and list roles
    __models.role.findAll().then(function (roles) {
        _module.render(req, res, edit_template, {
            title: __.t('m_users_backend_controllers_index_update'),
            roles: roles,
            user: req._user,
            id: req.params.cid
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, edit_template, {
            title: __.t('m_users_backend_controllers_index_update'),
            roles: null,
            users: null,
            id: 0
        });
    });
};

_module.course_of = function (req, res) {
    let email = req.params.email;
    __models.customer_register.findAll({
        include: [{
            model: __models.course, attributes: [
                'title'
            ]
        }],
        where: {
            email: email
        },
        attributes: ['full_name', 'email', 'register_date']
    }).then(function (results) {
        res.json(results);
    }).catch(function (err) {
        req.flash.error("Error: ", err.stack);
    })
};

_module.update = function (req, res, next) {
    let edit_user = null;
    let data = req.body;

    // Get user by id
    __models.user.findById(req.params.cid).then(function (user) {
        edit_user = user;
        return new Promise(function (fulfill, reject) {
            if (data.base64 && data.base64 != '' && data.base64 != user.user_image_url) {
                let fileName = folder_upload + slug(user.user_login).toLowerCase() + '.png';
                let base64Data = data.base64.replace(/^data:image\/png;base64,/, "");

                return writeFileAsync(__base + 'public' + fileName, base64Data, 'base64').then(function () {
                    data.user_image_url = fileName;
                    fulfill(data);
                }).catch(function (err) {
                    reject(err);
                });
            } else fulfill(data);
        })
    }).then(function (data) {
        return edit_user.updateAttributes(data).then(function () {
            req.flash.success(__.t('m_users_backend_controllers_index_update_flash_success'));

            if (req.url.indexOf('profile') !== -1) return res.redirect('/admin/users/profile/' + req.params.cid);

            return res.redirect('/admin/users/' + req.params.cid);
        });
    }).catch(function (error) {
        if (error.name == 'SequelizeUniqueConstraintError') {
            req.flash.error(__.t('m_users_backend_controllers_index_flash_email_exist'));
            return next();
        } else {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            return next();
        }
    });
};

_module.create = function (req, res) {
    // Add button
    let back_link = '/admin/users';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }
    res.locals.backButton = __acl.addButton(req, route, 'index', back_link);
    res.locals.saveButton = __acl.addButton(req, route, 'create');

    // Get list roles
    __models.role.findAll({
        order: "id asc"
    }).then(function (roles) {
        _module.render(req, res, edit_template, {
            title: __.t('m_users_backend_controllers_index_add_user'),
            roles: roles
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        _module.render(req, res, edit_template, {
            title: __.t('m_users_backend_controllers_index_add_user'),
            roles: null
        });
    });
};

_module.save = function (req, res, next) {
    let back_link = '/admin/users';
    let search_params = req.session.search;
    if (search_params && search_params[route + '_index_list']) {
        back_link = '/admin' + search_params[route + '_index_list'];
    }

    // Get form data
    var data = req.body;

    return new Promise(function (fulfill, reject) {
        if (data.base64 && data.base64 != '') {
            let fileName = folder_upload + slug(data.user_login).toLowerCase() + '.png';
            let base64Data = data.base64.replace(/^data:image\/png;base64,/, "");

            return writeFileAsync(__base + 'public' + fileName, base64Data, 'base64').then(function () {
                data.user_image_url = fileName;
                fulfill(data);
            }).catch(function (err) {
                reject(err);
            });
        } else fulfill(data);
    }).then(function (data) {
            __models.user.create(data).then(function (user) {
                req.flash.success(__.t('m_users_backend_controllers_index_add_flash_success'));
                res.redirect(back_link);
            }).catch(function (error) {
                if (error.name == 'SequelizeUniqueConstraintError') {
                    req.flash.error(__.t('m_users_backend_controllers_index_flash_email_exist'));
                    res.redirect(back_link);
                } else {
                    req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
                    res.redirect(back_link);
                }
            });
        })
};

_module.delete = function (req, res) {
    // Check delete current user
    let ids = req.body.ids;
    let id = req.user.id;
    let index = ids.indexOf(id);

    // Delete user
    if (index == -1) {
        __models.user.destroy({
            where: {
                id: {
                    "in": ids.split(',')
                }
            }
        }).then(function () {
            req.flash.success(__.t('m_users_backend_controllers_index_delete_flash_success'));
            res.sendStatus(204);
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            res.sendStatus(200);
        });
    } else {
        req.flash.warning(__.t('m_users_backend_controllers_index_delete_flash_success'));
        res.sendStatus(200);
    }
};

/**
 * Signout
 */
_module.signout = function (req, res) {
    let key = req.user.key;
    redis.del(key);
    req.logout();
    res.redirect('/admin/login');
};

/**
 * Profile
 */
_module.profile = function (req, res) {
    // Add button
    res.locals.saveButton = __acl.addButton(req, route, 'update_profile');
    _module.render(req, res, 'new.html', {
        user: req._user
    });
};
/**
 * Get Avatar library
 */
_module.getAvatarGallery = function (req, res) {
    readdirAsync(__base + 'public/avatar-gallery').then(function (files) {
        res.json(files);
    }).catch(function (err) {
        res.status(500).send(err.stack);
    })
};

/**
 * Change pass view
 */
_module.changePass = function (req, res) {
    _module.render(req, res, 'change-pass', {
        user: req.user
    });
};

/**
 * Update pass view
 */
_module.updatePass = function (req, res) {
    let old_pass = req.body.old_pass;
    let user_pass = req.body.user_pass;

    __models.user.findById(req.user.id).then(function (user) {
        if (user.authenticate(old_pass)) {
            user.updateAttributes({
                user_pass: user.hashPassword(user_pass)
            }).then(function () {
                req.flash.success(__.t('m_users_backend_controllers_index_update_pass_flash_success'));
            }).catch(function (error) {
                req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            }).finally(function () {
                _module.render(req, res, 'change-pass');
            });
        } else {
            req.flash.warning(__.t('m_users_backend_controllers_index_update_pass_flash_error'));
            _module.render(req, res, 'change-pass');
        }
    });
};

_module.saveOAuthUserProfile = function (req, profile, done) {
    __models.user.find({
        where: {
            user_email: profile.user_email
        }
    }).then(function (user) {
        if (user) {
            if (user.role_id !== profile.role_id) {
                profile.role_id = user.role_id
            }
            user.updateAttributes(profile).then(function (user) {
                return done(null, user);
            });
        } else {
            __models.user.create(profile).then(function (user) {
                return done(null, user);
            })
        }
    })
};

_module.userById = function (req, res, next, id) {
    __models.user.find({
        include: [
            {
                model: __models.role
            }
        ],
        where: {
            id: id
        }
    }).then(function (user) {
        req._user = user;
        next();
    })
};

_module.hasAuthorization = function (req, res, next) {
    if (req._user.id !== req.user.id) {
        return false;
    }
    return true;
};

module.exports = _module;