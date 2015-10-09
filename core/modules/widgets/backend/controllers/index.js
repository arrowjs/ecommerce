'use strict';

let _ = require('lodash'),
    redis = require('redis').createClient(),
    formidable = require('formidable'),
    admzip = require('adm-zip');
let Promise = require("bluebird");
let fs = require("fs");
let readFileAsync = Promise.promisify(fs.readFile);

let _module = new BackModule;

function sortWidgetByName(a, b) {
    if (a.config.name < b.config.name)
        return -1;
    if (a.config.name > b.config.name)
        return 1;
    return 0;
}

_module.index = function (req, res) {
    let widgets = __widget;

    _module.render(req, res, 'index', {
        title: "All Widgets",
        widgets: widgets.sort(sortWidgetByName)
    });
};

_module.sidebar = function (req, res, next) {
    readFileAsync(__base + "themes/frontend/" + __config.theme + "/theme.json", "utf8").then(function (data) {
        let widgets = __widget;

        _module.render(req, res, 'sidebars', {
            title: "Sidebars",
            sidebars: JSON.parse(data).sidebars,
            widgets: widgets.sort(sortWidgetByName)
        });
    });
};

_module.addWidget = function (req, res) {
    let widget = __.getWidget(req.params.widget);

    widget.render_setting(req.params.widget).then(function (re) {
        res.send(re);
    });
};

_module.saveWidget = function (req, res) {
    let widget_type = req.body.widget;
    var widget = __.getWidget(widget_type);

    let data = req.body;
    data.created_by = req.user.id;

    widget.save(data).then(function (id) {
        _module.clear_sidebar_cache(req, res, id);
    })
};

_module.read = function (req, res) {
    __models.widgets.findById(req.params.cid).then(function (widget) {
        let w = __.getWidget(widget.widget_type);
        w.render_setting(req, res, widget.widget_type, widget).then(function (re) {
            res.send(re);
        });
    });
};

_module.delete = function (req, res) {
    __models.widgets.destroy({where: {id: req.params.cid}}).then(function () {
        _module.clear_sidebar_cache(req, res, req.params.cid);
    }).catch(function (err) {
        console.log(err.stack);
    });
};

_module.sidebar_sort = function (req, res) {
    let ids = req.body.ids.split(',');
    let sidebar = req.body.sidebar;
    let index = 1;
    let promises = [];

    for (let i in ids) {
        if (ids[i] == '') {
            index++;
            continue;
        }

        promises.push(__models.sequelize.query("Update " + __models.widgets.getTableName() + " set ordering=?, sidebar=? where id=?",
            {
                replacements: [index++, sidebar, ids[i]]
            }));
    }

    Promise.all(promises).then(function (results) {
        res.sendStatus(200);
    });
};

_module.clear_sidebar_cache = function (req, res, id) {
    redis.keys(__config.redis_prefix + "sidebar:*", function (err, keys) {
        if (keys.length > 0) {
            redis.del(keys, function (err, result) {
                //req.flash.success(__.t('m_widgets_backend_controller_index_flash_cache_delete'));
            });
        }
    });
    res.send(id.toString())
};

_module.importWidget = function (req, res) {
    let max_size = 100;

    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let file_size = Math.round(files.zip_file.size / 1000);
        let file_name = files.zip_file.name;
        let tmp_path = files.zip_file.path;

        if (file_size > max_size) {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_large') + max_size + " KB");
            return res.redirect('/admin/widgets');
        }

        if (file_name.substr(file_name.lastIndexOf('.') + 1) != 'zip') {
            req.flash.error(__.t('m_modules_backend_controllers_index_import_size_type_error'));
            return res.redirect('/admin/widgets');
        }

        // Use admzip to unzip uploaded file
        var zip = new admzip(tmp_path);
        var zipEntries = zip.getEntries();

        // Extract all inside files to app/widgets
        try {
            zipEntries.forEach(function (zipEntry) {
                if (zipEntry.isDirectory == false) {
                    zip.extractEntryTo(zipEntry.entryName, __base + 'app/widgets/');
                }
            });

            req.flash.success(__.t('m_widgets_backend_controller_index_flash_import_success'));

            // Check security of imported widget
            let widget_name = '';
            for (let zipEntry in zipEntries) {
                if (zipEntries.hasOwnProperty(zipEntry)) {
                    widget_name = zipEntries[zipEntry].entryName.split('/')[0];
                    break;
                }
            }
            let widget_path = __base + 'app/widgets/' + widget_name;
            let result = [];

            __.checkDirectorySecurity(widget_path, result);

            if (result == false) {
                req.flash.warning('Cannot get activities of this widget!');
            } else {
                let list_activities = '';

                result.forEach(function (obj) {
                    if (obj.hasOwnProperty('file_path')) {
                        list_activities += obj.file_path + __.t('m_modules_backend_views_index_javascript_check_security_activities') + ' : <br/>';
                    }

                    if (obj.hasOwnProperty('file_activities')) {
                        list_activities += '- ' + obj.file_activities + '<br/>';
                    }

                    if (obj.hasOwnProperty('database_activities')) {
                        list_activities += '- ' + obj.database_activities + '<br/>';
                    }
                });

                if (list_activities != '') {
                    list_activities = __.t('m_modules_backend_views_index_javascript_check_security_html_var_else') + ' : <br/>' + list_activities;
                }
                req.flash.warning(list_activities);
            }
        } catch (error) {
            req.flash.error(error);
        }

        res.redirect('/admin/widgets');
    });
};

module.exports = _module;