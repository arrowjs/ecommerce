'use strict';

let _ = require('arrowjs')._;
let promise = require('arrowjs').Promise;
let slug = require('slug');
let formidable = require('formidable');
promise.promisifyAll(formidable);

let _log = require('arrowjs').logger;

module.exports = function (controller, component, application) {

    let redis = application.redisClient;
    let adminPrefix = application.getConfig('admin_prefix') || 'admin';
    let redisPrefix = application.getConfig('redis_prefix') || 'arrowCMS_';
    let itemOfPage = application.getConfig('pagination').numberItem || 10;
    let isAllow = ArrowHelper.isAllow;

    controller.orderList = function (req, res) {
        let page = req.params.page || 1;

        // Add toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton('/admin/products/order');
        toolbar.addSearchButton(isAllow(req, 'index'));
        //toolbar.addDeleteButton(isAllow(req, 'category_delete'));
        toolbar = toolbar.render();

        let tableStructure = [
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
        ];

        // Config columns
        let filter = ArrowHelper.createFilter(req, res, tableStructure, {
            rootLink: '/admin/products/order/page/' + page + '/sort',
            limit: itemOfPage
        });

        // Find all products
        application.models.order.findAndCountAll({
            where: filter.values,
            order: filter.sort,
            limit: filter.limit,
            offset: filter.offset
        }).then(function (results) {
            //console.log(JSON.stringify(results));
            let totalPage = Math.ceil(results.count / itemOfPage);

            // Render view
            res.backend.render('order/index', {
                title: 'Danh sách đơn hàng',
                totalPage: totalPage,
                items: results.rows,
                currentPage: page,
                url : req.url,
                toolbar: toolbar
            });
        }).catch(function (error) {
            req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
            // Render view if has error
            res.backend.render(req, res, 'order/index', {
                title: 'Danh sách đơn hàng',
                totalPage: 1,
                items: null,
                currentPage: page
            });
        });
    };

    controller.orderUpdate = function (req,res) {

        let id = req.body.id || 0 ;
        application.models.order.update({
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
        }).catch(function (err) {
            console.log(err);
        })
    };

    controller.orderView = function (req,res) {
        application.models.order.find({
            where : {
                id : req.query.id || 0
            }
        }).then(function (order) {
            res.backend.render('order/detail',
                {
                    order : order,
                    url:req.query.url || '/admin/products/order'
                });
        }).catch(function (err) {
            console.log(err);
            res.send('Không tìm thấy đơn hàng');
        })

    }
};