'use strict';

let path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    redis = require('redis').createClient(),
    formidable = require('formidable'),
    admzip = require('adm-zip');

let _module = new BackModule;
let moduleManager = require('arrowjs/moduleManager');
let menuManager = require('arrowjs/menuManager');


_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: __.t('m_modules_backend_controllers_index_render_title'),
        modules: __modules
    });
};

_module.checkSecurity = function (req, res) {
    let module_path = __base + 'app/modules/' + req.params.alias;
    let result = [];

    __.checkDirectorySecurity(module_path, result);

    if (result == false) {
        res.send(__.t('m_modules_backend_controllers_index_check_security'));
    } else {
        res.send(result);
    }
};

_module.active = function (req, res) {
    let module = __modules[req.params.alias];

    if (module.active == undefined || module.active == false) {
        req.flash.success(__.t('m_modules_backend_controllers_index_active_success', module.title));
        module.active = true;
        menuManager.addMenu(req.params.alias);
    } else {
        req.flash.warning(__.t('m_modules_backend_controllers_index_active_failure', module.title));
        module.active = false;
        menuManager.removeMenu(req.params.alias);
    }

    redis.set(__config.redis_prefix + 'backend_menus', JSON.stringify(__menus), redis.print, function () {
        redis.set(__config.redis_prefix + 'all_modules', JSON.stringify(__modules), redis.print, function () {
            moduleManager.loadAllModules().then(function () {
                return res.redirect('/admin/modules');res.redirect('/admin/modules')
            })
        });
    });
};

_module.reload = function (req, res) {
    moduleManager.loadAllModules().then(function () {
        req.flash.success(__.t('m_modules_backend_controllers_index_reload_success'));
        res.redirect('/admin/modules');
    });
};

_module.importModule = function (req, res) {
    let core_modules = ['blog', 'configurations', 'dashboard', 'menus', 'modules', 'plugins', 'roles', 'uploads', 'users', 'widgets'];
    let max_size = 100;
    let form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_large') + max_size + " KB");
            return res.redirect('/admin/modules');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_type_error'));
            return res.redirect('/admin/modules');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        try {
            let extract = true;

            for (let zipEntry in zipEntries) {
                if (zipEntries.hasOwnProperty(zipEntry)) {
                    let entry = zipEntries[zipEntry];

                    // Check if imported module has same name as core module
                    if (core_modules.indexOf(entry.entryName.split('/')[0]) > -1) {
                        req.flash.error(__.t('m_modules_backend_controllers_index_import_same_name_error'));
                        extract = false;
                        break;
                    }

                    // Extract all inside files to app/modules
                    if (entry.isDirectory == false) {
                        zip.extractEntryTo(entry.entryName, __base + 'app/modules/');
                    }
                }
            }

            // Reload all modules
            moduleManager.loadAllModules();

            if (extract) req.flash.success(__.t('m_modules_backend_controllers_index_import_success'));
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/modules');
    });
};

//todo: don't import module has same name as core, this action can only manually

module.exports = _module;
