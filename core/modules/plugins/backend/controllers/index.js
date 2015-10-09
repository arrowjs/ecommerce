'use strict';

let _ = require('lodash'),
    redis = require('redis').createClient(),
    fs = require('fs'),
    formidable = require('formidable'),
    admzip = require('adm-zip');

let Promise = require('bluebird');
Promise.promisifyAll(formidable);
let pluginManager = require('arrowjs/pluginManager');

let _module = new BackModule;

function renderView(req, res, env, plugin) {
    env.render('setting.html', {
        title: __.t('m_plugins_backend_controllers_index_render_view_title'),
        plugin: plugin
    }, function (err, re) {
        if (err) {
            res.send(err);
        } else {
            _module.render(req, res, 'setting.html', {
                setting_form: re,
                plugin: plugin,
                title: __.t('m_plugins_backend_controllers_index_render_view_detail')
            });
        }
    });
}

_module.index = function (req, res) {
    _module.render(req, res, 'index', {
        title: __.t('m_plugins_backend_controllers_index_render'),
        plugins: pluginManager.plugins
    });
};

_module.setting = function (req, res) {
    let plugin = pluginManager.getPlugin(req.params.alias);

    if (fs.existsSync(__base + 'app/plugins/' + req.params.alias + '/setting.html')) {
        let env = __.createNewEnv([__base + 'app/plugins/' + req.params.alias]);
        renderView(req, res, env, plugin);
    } else {
        if (fs.existsSync(__base + 'core/plugins/' + req.params.alias + '/setting.html')) {
            let env = __.createNewEnv([__base + 'core/plugins/' + req.params.alias]);
            renderView(req, res, env, plugin);
        } else {
            _module.render(req, res, 'setting.html', {
                plugin: plugin,
                title: __.t('m_plugins_backend_controllers_index_render_view_detail')
            });
        }
    }
};

_module.save_setting = function (req, res, next) {
    let plugin = pluginManager.getPlugin(req.params.alias);
    plugin.options = req.body;

    redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(pluginManager.plugins), redis.print);

    req.flash.success(__.t('m_plugins_backend_controllers_index_flash_save_success'));
    next();
};

_module.checkSecurity = function (req, res) {
    let plugin_path = __base + 'app/plugins/' + req.params.alias;
    let result = [];

    __.checkDirectorySecurity(plugin_path, result);

    if (result == false) {
        res.send(__.t('Cannot get activities of this plugin !'));
    } else {
        res.send(result);
    }
};

_module.active = function (req, res) {
    let alias = req.params.alias;
    let plugin = pluginManager.getPlugin(alias);

    if (plugin.active == undefined || plugin.active == false) {
        req.flash.success(plugin.name + __.t('m_plugins_backend_controllers_index_active_success'));
    } else {
        req.flash.warning(plugin.name + __.t('m_plugins_backend_controllers_index_active_warning'));
    }
    plugin.active = !plugin.active;

    redis.set(__config.redis_prefix + 'all_plugins', JSON.stringify(pluginManager.plugins), redis.print);
    return res.redirect('/admin/plugins');
};

_module.reload = function (req, res) {
    pluginManager.reloadAllPlugins();

    req.flash.success(__.t('m_plugins_backend_controllers_index_reload_success'));
    res.redirect('/admin/plugins');
};

_module.importPlugin = function (req, res) {
    let max_size = 100;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_large') + max_size + " KB");
            return res.redirect('/admin/plugins');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_type_error'));
            return res.redirect('/admin/plugins');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        // Extract all inside files to app/plugins
        try {
            zipEntries.forEach(function (zipEntry) {
                if (zipEntry.isDirectory == false) {
                    zip.extractEntryTo(zipEntry.entryName, __base + 'app/plugins/');
                }
            });

            // Reload all plugins
            let mm = require(__base + 'core/libs/plugins_manager.js');
            mm.reloadAllPlugins();

            req.flash.success(__.t('m_plugins_backend_controllers_index_import_success'));
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/plugins');
    });
};

module.exports = _module;