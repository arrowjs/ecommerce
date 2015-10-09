'use strict';

module.exports = function (modules) {
    modules.menus = {
        title: __.t('m_menus_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.0.1',
        description: __.t('m_menus_backend_module_desc'),
        rules: [
            {
                name: 'index',
                title: __.t('m_menus_backend_module_rules_index')
            },
            {
                name: 'create',
                title: __.t('m_menus_backend_module_rules_create')
            },
            {
                name: 'update',
                title: __.t('m_menus_backend_module_rules_update')
            },
            {
                name: 'delete',
                title: __.t('m_menus_backend_module_rules_delete')
            }
        ],
        backend_menu: {
            title: __.t('m_menus_backend_module_backend_menu_title'),
            icon: "fa fa-bars",
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_menus_backend_module_backend_menu_index'),
                    link: '/'
                },
                {
                    rule: 'create',
                    title: __.t('m_menus_backend_module_backend_menu_create'),
                    link: '/create'
                },
                {
                    rule: 'update',
                    title: __.t('m_menus_backend_module_backend_menu_update'),
                    link: '/sort-admin-menu'
                }
            ]
        }
    };

    return modules;
};

