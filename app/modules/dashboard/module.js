'use strict';

module.exports = function (modules) {
    modules.dashboard = {
        title: __.t('m_dashboard_frontend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: __.t('m_dashboard_frontend_module_desc'),
        rules: [
            {
                name: 'index',
                title: __.t('view')
            }
        ]
    };

    return modules;
};

