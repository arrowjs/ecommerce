'use strict';

module.exports = function (modules) {
    modules.modules = {
        title: __.t('m_modules_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.0',
        description: __.t('m_modules_backend_module_desc'),
        system: true,
        rules: [
            {
                name: 'index',
                title: __.t('m_modules_backend_module_rules_index')
            },
            {
                name: 'active',
                title: __.t('m_modules_backend_module_rules_active')
            },
            {
                name: 'import',
                title: __.t('m_modules_backend_module_import')
            }
        ],
        backend_menu: {
            title: __.t('m_modules_backend_module_menu_title'),
            icon: "fa fa-rocket",
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_modules_backend_module_menu_title_index'),
                    link: '/'
                }
            ]
        }
    };

    return modules;
};

