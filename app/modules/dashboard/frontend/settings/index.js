'use strict';

module.exports = function (app, config) {
    let alias = 'index';

    app.route('/_menus/' + alias + '/page/:page').get(function (req, res) {
        if (req.isAuthenticated()) {
            // Send json response
            res.jsonp({
                totalRows: 1,
                totalPage: 1,
                items: [
                    {
                        'title': __.t('m_dashboard_frontend_setting_title_home'),
                        'link': '/'
                    }
                ],
                title_column: 'title',
                link_template: '{link}'
            });
        }
        else {
            res.send(__.t("not_authenticated"));
        }
    });

    return {
        title: __.t('m_dashboard_frontend_setting_static_page'),
        alias: alias,
        search: false
    };
};