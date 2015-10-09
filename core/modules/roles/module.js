'use strict';

module.exports = function (modules) {
    modules.roles = {
        title: __.t('m_roles_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: __.t('m_roles_backend_module_desc'),
        rules: [
            {
                name: 'index',
                title: __.t('m_roles_backend_module_rules_index')
            },
            {
                name: 'create',
                title: __.t('m_roles_backend_module_rules_create')
            },
            {
                name: 'update',
                title: __.t('m_roles_backend_module_rules_update')
            },
            {
                name: 'delete',
                title: __.t('m_roles_backend_module_rules_delete')
            }
        ],
        backend_menu: {
            title: __.t('m_roles_backend_module_backend_menu_title'),
            icon: "fa fa-group",
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_roles_backend_module_backend_menu_menus_index'),
                    link: '/'
                },
                {
                    rule: 'create',
                    title: __.t('m_roles_backend_module_backend_menu_menus_create'),
                    link: '/create'
                }
            ]
        }
    };

    return modules;
};

