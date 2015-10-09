'use strict';

module.exports = function (modules) {
    modules.plugins = {
        title: __.t('m_plugins_backend_module_title'),
        author: 'Jack',
        version: '0.1.0',
        description: __.t('m_plugins_backend_module_desc'),
        rules: [
            {
                name: 'index',
                title: __.t('m_plugins_backend_module_rules_index')
            },
            {
                name: 'active',
                title: __.t('m_plugins_backend_module_rules_active')
            },
            {
                name: 'import',
                title: __.t('m_plugins_backend_module_rules_import')
            }
        ],
        backend_menu: {
            title: __.t('m_plugins_backend_module_backend_menu_title'),
            icon: "fa fa-thumb-tack",
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_plugins_backend_module_backend_menu_menus_index'),
                    link: '/'
                }
            ]
        }
    };

    return modules;
};

