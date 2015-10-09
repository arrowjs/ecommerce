'use strict';

module.exports = function (modules) {
    modules.blog = {
        title: __.t('m_blog_backend_module_title'),
        author: 'TechmasterVN',
        version: '0.0.1',
        description: __.t('m_blog_backend_module_desc'),
        rules: [
            {
                name: 'category_index',
                title: __.t('m_blog_backend_module_category_index')
            },
            {
                name: 'category_create',
                title: __.t('m_blog_backend_module_category_create')
            },
            {
                name: 'category_edit',
                title: __.t('m_blog_backend_module_category_edit')
            },
            {
                name: 'category_delete',
                title: __.t('m_blog_backend_module_category_delete')
            },
            {
                name: 'post_index',
                title: __.t('m_blog_backend_module_post_index')
            },
            {
                name: 'post_create',
                title: __.t('m_blog_backend_module_post_create')
            },
            {
                name: 'post_edit',
                title: __.t('m_blog_backend_module_post_edit')
            },
            {
                name: 'post_edit_all',
                title: __.t('m_blog_backend_module_post_edit_all')
            },
            {
                name: 'post_delete',
                title: __.t('m_blog_backend_module_post_delete')
            },
            {
                name: 'page_index',
                title: __.t('m_blog_backend_module_page_index')
            },
            {
                name: 'page_create',
                title: __.t('m_blog_backend_module_page_create')
            },
            {
                name: 'page_edit',
                title: __.t('m_blog_backend_module_page_edit')
            },
            {
                name: 'page_edit_all',
                title: __.t('m_blog_backend_module_page_edit_all')
            },
            {
                name: 'page_delete',
                title: __.t('m_blog_backend_module_page_delete')
            }
        ],
        backend_menu: {
            title: __.t('m_blog_backend_module_menu_backend_menu_title'),
            icon: 'fa fa-newspaper-o',
            menus: [
                {
                    rule: 'post_index',
                    title: __.t('m_blog_backend_module_menu_backend_menu_post_index'),
                    link: '/posts/page/1'
                },
                {
                    rule: 'page_index',
                    title: __.t('m_blog_backend_module_menu_backend_menu_page_index'),
                    link: '/pages/page/1'
                },
                {
                    rule: 'category_index',
                    title: __.t('m_blog_backend_module_menu_backend_menu_category_index'),
                    link: '/categories/page/1'
                }
            ]
        }
    };

    return modules;
};

