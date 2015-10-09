'use strict';

module.exports = function (modules) {
    modules.widgets = {
        title: __.t('m_widgets_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.1',
        description: __.t('m_widgets_backend_module_desc'),
        rules: [
            {
                name: 'index',
                title: __.t('m_widgets_backend_module_rules_index')
            },
            {
                name: 'import',
                title: __.t('m_widgets_backend_module_rules_import')
            }
        ],
        backend_menu: {
            title: __.t('m_widgets_backend_module_menu_title'),
            icon: 'fa fa-file-text',
            menus: [
                {
                    rule: 'index',
                    title: __.t('m_widgets_backend_module_menus_index_sidebars'),
                    link: '/sidebars'
                },
                {
                    rule: 'index',
                    title: __.t('m_widgets_backend_module_menus_index_widgets'),
                    link: '/'
                }
            ]
        }
    };

    return modules;
};

