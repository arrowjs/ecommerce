'use strict';

module.exports = function (modules) {
    modules.configurations = {
        title: __.t('m_configurations_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.0.1',
        description: __.t('m_configurations_backend_module_desc'),
        rules: [
            {
                name: 'update_info',
                title: __.t('m_configurations_backend_module_rules_update_info')
            },
            {
                name: 'change_themes',
                title: __.t('m_configurations_backend_module_rules_change_themes')
            },
            {
                name: 'import_themes',
                title: __.t('m_configurations_backend_module_rules_import_themes')
            },
            {
                name: 'delete_themes',
                title: __.t('m_configurations_backend_module_rules_delete_themes')
            }
        ],
        backend_menu: {
            title: __.t('m_configurations_backend_module_backend_menu_title') ,
            icon: "fa fa-cog",
            menus: [
                {
                    rule: 'update_info',
                    title: __.t('m_configurations_backend_module_backend_menu_update_info') ,
                    link: '/site-info'
                },
                {
                    rule: 'change_themes',
                    title: __.t('m_configurations_backend_module_backend_menu_change_themes') ,
                    link: '/themes'
                }
            ]
        }
    };

    return modules;
};

