'use strict';

var _ = require('lodash');
var redis = require("redis").createClient();

let _module = new BackModule;
let route = 'configurations';
var configManager = require('arrowjs/configManager');
var moduleManager = require('arrowjs/moduleManager');
var widgetManager = require('arrowjs/widgetManager');

_module.index = function (req, res) {
    let themes = [];

    __.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });

    let current_theme;
    for (let i in themes) {
        if (themes.hasOwnProperty(i) && themes[i].alias.toLowerCase() == __config.theme.toLowerCase()) {
            current_theme = themes[i];
        }
    }

    _module.render(req, res, 'themes/index', {
        themes: themes,
        current_theme: current_theme,
        title: __.t('m_configurations_backend_themes_render_title')
    });
};

_module.detail = function (req, res) {
    res.locals.backButton = __acl.addButton(req, route, 'change_themes', '/admin/configurations/themes');

    let themes = [];

    __.getGlobbedFiles(__base + 'themes/frontend/*/theme.json').forEach(function (filePath) {
        themes.push(require(filePath));
    });

    let current_theme;
    for (let i in themes) {
        if (themes.hasOwnProperty(i) && themes[i].alias.toLowerCase() == req.params.themeName) {
            current_theme = themes[i];
        }
    }

    _module.render(req, res, 'themes/detail', {
        current_theme: current_theme,
        title: __.t('m_configurations_backend_themes_render_detail')
    });
};

_module.change_themes = function (req, res) {
    __config.theme = req.params.themeName;

    redis.set(__config.redis_prefix + __config.key, JSON.stringify(__config), function () {
        configManager.reloadConfig().then(function (k) {
            moduleManager.loadAllModules().then(function () {
                _module.clearCache(function () {
                    widgetManager();
                    res.send(__.t('m_configurations_backend_themes_change_message_success'));
                })
            });
        })
    });

};

_module.delete = function (req, res) {
    res.send(__.t('m_configurations_backend_themes_change_message_success'))
};

_module.import = function (req, res) {
    res.send(__.t('m_configurations_backend_themes_change_message_success'))
};

_module.clearCache = function (callback) {
    redis.keys(__config.redis_prefix + "sidebar:*", function (err, keys) {
        if (keys.length > 0) {
            redis.del(keys, function (err, result) {
                callback(err);
            });
        } else {
            callback(null);
        }
    });
};

module.exports = _module;