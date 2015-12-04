'use strict';

module.exports = {
    title: "Products",
    author: 'Techmaster',
    version: '0.1.0',
    description: 'Products manager system',
    permissions: [
        {
            name : 'index',
            title : 'View All product'
        },
        {
            name : 'create',
            title : 'Create products'
        },
        {
            name : 'edit',
            title : 'Edit products'
        },
        {
            name : 'delete',
            title : 'Delete products'
        },
        {
            name : 'category_index',
            title : 'View All product category'
        },
        {
            name : 'category_create',
            title : 'Create products category'
        },
        {
            name : 'category_edit',
            title : 'Edit products category'
        },
        {
            name : 'category_delete',
            title : 'Delete products category'
        },
        {
            name : 'order',
            title : 'Quản lý đơn hàng'
        }
    ],
    backend_menu: {
        title: 'Quản lý sản phẩm',
        icon: 'fa fa-newspaper-o',
        menus: [
            {
                permission : 'index',
                title: 'Danh sách',
                link: '/'
            },
            {
                permission : 'create',
                title : 'Thêm mới',
                link : '/create'
            },
            {
                permission : 'category_index',
                title : 'Danh mục',
                link : '/categories'
            },
            {
                 permission : 'order',
                title : 'Đơn hàng',
                link : '/order'
            }
        ]
    }
};

