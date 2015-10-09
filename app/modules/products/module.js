/**
 * Created by thangnv on 7/28/15.
 */


module.exports = function (modules) {

    modules.products = {
        title : 'Products',
        author : 'thangnv',
        version : '0.0.1',
        description : 'Products manager system',
        rules : [
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
        backend_menu : {
            title : 'Quản lý sản phẩm',
            icon : 'fa fa-newspaper-o',
            menus : [
                {
                    rule : 'index',
                    title : 'Danh sách',
                    link : '/'
                },
                {
                    rule : 'create',
                    title : 'Thêm mới',
                    link : '/create'
                },
                {
                    rule : 'category_index',
                    title : 'Danh mục',
                    link : '/categories'
                },
                {
                    rule : 'order',
                    title : 'Đơn hàng',
                    link : '/order'
                }
            ]
        }
    };
    return modules;
};