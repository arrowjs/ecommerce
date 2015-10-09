/**
 * Created by thangnv on 8/17/15.
 */
"use strict";
let _module = new BackModule();
let module_name = 'order';

_module.list = function (req, res) {
    res.locals.createButton = __acl.addButton(req, module_name, 'order', '/admin/products/order/create');
    res.locals.deleteButton = __acl.addButton(req, module_name, 'order');
    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';

    res.locals.root_link = '/admin/products/order/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, module_name, '/admin/products/order', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: 'name',
            width: '19%',
            header: 'Tên khách hành',
            link: 'javascript:orderDetail({id});',
            acl: 'order',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'email',
            width: '15%',
            header: 'E-Mail',
            type: 'number',
            filter: {
                data_type: 'integer',
                filter_key : 'email'
            }
        },
        {
            column: 'phone',
            width: '15%',
            header: 'Điện thoại',
            type: 'integer',
            filter: {
                type: 'integer',
                filter_key: 'phone'
            }
        },
        {
            column: 'address',
            width: '33%',
            header: 'Địa chỉ',
            type: 'integer',
            filter: {
                type: 'string',
                filter_key: 'address'
            }
        },
        {
            column: 'status',
            width: '10%',
            header: 'Tình trạng',
            type: 'custom',
            alias: {
                "2": "<span class=\"label label-primary\">Đã thanh toán</span>",
                "1": "<span class=\"label label-warning\">Đang giao hàng</span>",
                "0": "<span class=\"label label-danger\">Chưa xác nhận</span>"
            },
            filter: {
                type: 'select',
                filter_key: 'status',
                data_source: [
                    {
                        name: 'Đã thanh toán',
                        value: 2
                    },
                    {
                        name: 'Đang giao hàng',
                        value: 1
                    },
                    {
                        name: 'Chưa xác nhận',
                        value: 0
                    }
                ],
                display_key: 'name',
                value_key: 'value'
            }
        }
        //,
        //{
        //    column: 'products',
        //    width: '7%',
        //    header: 'Chi tiết',
        //    type: 'json',
        //    link : 'javascript:detail({id})',
        //    alias : 'Xem'
        //}
    ]);

    // Find all products
    __models.order.findAndCountAll({
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        //console.log(JSON.stringify(results));
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);

        // Render view
        _module.render(req, res, 'order/index', {
            title: 'Danh sách đơn hàng',
            totalPage: totalPage,
            items: results.rows,
            currentPage: page,
            url : req.url
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        // Render view if has error
        _module.render(req, res, 'order/index', {
            title: 'Danh sách đơn hàng',
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });

}
_module.delete = function (req, res) {

}
_module.update = function (req,res) {

    let id=req.body.id || 0 ;
        __models.order.update({
            status : req.body.status || 0
        },
        {
            where : {
                id : id
            }
        }
    ).then(function (result) {
        if(result > 0){
            res.send(req.body.status);
        }else{
            res.send(null);
        }
    })
}
_module.view = function (req,res) {
    console.log('view detail : '+req.param('id'));
    //req.params.id
    __models.order.find({
        where : {
            id : req.param('id') || 0
        }
    }).then(function (order) {
        _module.render(req,res,'order/detail',
            {
                order : order,
                url:req.param('url') || '/admin/products/order'
            });
    }).catch(function (err) {
        console.log(err);
        res.send('Không tìm thấy đơn hàng');
    })

}
module.exports = _module;