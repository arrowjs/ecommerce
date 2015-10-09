/**
 * Created by thangnv on 7/28/15.
 */
'use strict';

let Promise     = require('bluebird');
let formidable  = require('formidable'),
    fs          = require('fs');
let _module = new BackModule;
let module_name = 'products';


_module.list = function (req, res) {
    //console.log('products')
    // Add buttons
    res.locals.createButton = __acl.addButton(req, module_name, 'create', '/admin/products/create');
    res.locals.deleteButton = __acl.addButton(req, module_name, 'delete');
    // Get current page and default sorting
    let page = req.params.page || 1;
    let column = req.params.sort || 'id';
    let order = req.params.order || 'desc';

    res.locals.root_link = '/admin/products/page/' + page + '/sort';

    // Create filter
    let filter = __.createFilter(req, res, module_name, '/admin/products', column, order, [
        {
            column: "id",
            width: '1%',
            header: "",
            type: 'checkbox'
        },
        {
            column: 'title',
            width: '25%',
            header: 'Tiêu đề sản phẩm',
            link: '/admin/products/{id}',
            acl: 'products.edit',
            filter: {
                data_type: 'string'
            }
        },
        {
            column: 'quantity',
            width: '10%',
            header: 'Số lượng',
            type: 'number',
            filter: {
                data_type: 'integer',
                filter_key : 'quantity'
            }
        },
        {
            column: 'price',
            width: '10%',
            header: 'Giá',
            type: 'integer',
            filter: {
                type: 'integer',
                filter_key: 'price'
            }
        },
        {
            column: 'price_sale',
            width: '10%',
            header: 'Khuyến mại',
            type: 'integer',
            filter: {
                type: 'integer',
                filter_key: 'price_sale'
            }
        },
        {
            column: 'status',
            width: '10%',
            header: 'Tình trạng',
            type: 'custom',
            alias: {
                "1": "Cũ",
                "0": "Mới"
            },
            filter: {
                type: 'select',
                filter_key: 'status',
                data_source: [
                    {
                        name: 'Cũ',
                        value: 1
                    },
                    {
                        name: 'Mới',
                        value: 0
                    }
                ],
                display_key: 'name',
                value_key: 'value'
            }
        }
    ]);

    // Find all products
    __models.product.findAndCountAll({
        include: [
            {
                model: __models.user, attributes: ['display_name'],
                where: ['1 = 1']
            }
        ],
        where: filter.values,
        order: filter.sort,
        limit: __config.pagination.number_item,
        offset: (page - 1) * __config.pagination.number_item
    }).then(function (results) {
        //console.log(JSON.stringify(results));
        let totalPage = Math.ceil(results.count / __config.pagination.number_item);

        // Render view
        _module.render(req, res, 'product/index', {
            title: 'Danh sách sản phẩm',
            totalPage: totalPage,
            items: results.rows,
            currentPage: page
        });
    }).catch(function (error) {
        req.flash.error('Name: ' + error.name + '<br />' + 'Message: ' + error.message);
        // Render view if has error
        _module.render(req, res, 'product/index', {
            title: 'Danh sách sản phẩm',
            totalPage: 1,
            items: null,
            currentPage: page
        });
    });
}
_module.delete = function (req, res) {
    //console.log('delete products');
    __models.product.findAll({
        where: {
            id: {
                in: req.param('ids').split(',')
            }
        }
    }).then(function (products) {
        products.forEach(function (product) {
            let tag = product.categories;
            if (tag != null && tag != '') {
                tag = tag.split(':');
                tag.shift();
                tag.pop(tag.length - 1);

                if (tag.length > 0) {
                    tag.forEach(function (id) {
                        __models.category.findById(id).then(function (cat) {
                            let count = +cat.count - 1;
                            cat.updateAttributes({
                                count: count
                            });
                        });
                    });
                }
            }
            __models.product.destroy({
                where: {
                    id: product.id
                }
            }).catch(function(err) {
                req.flash.error('Product id: ' + post.id + ' | ' + err.name + ' : ' + err.message);
            });
        });
        req.flash.success('Xóa sản phẩm thành công');
        res.sendStatus(200);
    });
}
_module.create = function (req, res) {

    res.locals.backButton = __acl.addButton(req,module_name , 'index','/products');
    res.locals.saveButton = __acl.addButton(req, module_name, 'create','/products');
    //console.log(res.locals);
    Promise.all([
        __models.product_category.findAll({
            order: "id asc"
        })
    ]).then(function (results) {
        _module.render(req,res,'product/new',{
            categories : results[0]
        });
    }).catch(function (err) {

    })

}
_module.view = function (req, res) {

    res.locals.backButton = __acl.addButton(req, module_name, 'index', '/admin/products');
    res.locals.saveButton = __acl.addButton(req, module_name, 'edit');
    res.locals.deleteButton = __acl.addButton(req, module_name, 'delete');

    Promise.all([
        __models.product_category.findAll({
            order: "id asc"
        }),
        __models.user.findAll({
            order: "id asc"
        }),
        __models.product.find({
            include: [__models.user],
            where: {
                id: req.params.pid,
            }
        })
    ]).then(function (results) {
        // nut xem nhanh san pham o người dùng
        //res.locals.viewButton = 'posts/' + results[2].id + '/' + results[2].alias;

        let data = results[2];
        let images = data.images.split(':::');
        if(images[0].length <= 0){
            images.splice(0,1);
        }
        //console.log(images);
        data.content = data.content.replace(/&lt/g, "&amp;lt");
        _module.render(req, res, 'product/new', {
            title : 'Cập nhật sản phẩm',
            categories : results[0],
            users: results[1],
            product: data,
            images : images
        });
    });
}
_module.update = function (req, res, next) {
    //console.log('update post');
    res.locals.backButton = __acl.addButton(req, module_name, 'index', '/admin/products');
    res.locals.createButton = __acl.addButton(req, module_name, 'create', '/admin/products/create');
    res.locals.saveButton = __acl.addButton(req, module_name, 'edit');
    res.locals.deleteButton = __acl.addButton(req, module_name, 'delete');

    let data = req.body;
    data.categories = data.categories || "";
    __models.product.findById(req.params.pid).then(function (product) {
        let tag = product.categories;
        if (tag != null && tag != '') {
            tag = tag.split(':');
            tag.shift();
            tag.pop(tag.length - 1);
        } else tag = [];
        let newtag = data.categories;
        if (newtag != null && newtag != '') {
            newtag = newtag.split(':');
            newtag.shift();
            newtag.pop(newtag.length - 1);
        } else newtag = [];

        /**
         * Update count for category
         */
        let onlyInA = [],
            onlyInB = [];

        if (Array.isArray(tag) && Array.isArray(newtag)) {
            onlyInA = tag.filter(function (current) {
                return newtag.filter(function (current_b) {
                        return current_b == current
                    }).length == 0
            });
            onlyInB = newtag.filter(function (current) {
                return tag.filter(function (current_a) {
                        return current_a == current
                    }).length == 0
            });
        }
        if (typeof Number(data.price_sale) != 'number')data.price_sale = 0;
        product.updateAttributes(data).then(function () {
            Promise.all([
                Promise.map(onlyInA, function (id) {
                    return __models.product_category.findById(id).then(function (tag) {
                        let count = tag.count - 1;
                        return tag.updateAttributes({
                            count: count
                        })
                    });
                }),
                Promise.map(onlyInB, function (id) {
                    return __models.product_category.findById(id).then(function (tag) {
                        let count =tag.count + 1;
                        return tag.updateAttributes({
                            count: count
                        })
                    });
                })
            ]).then(function (data) {
                req.flash.success('Cập nhật product thành công');
                next();
            }).catch(function (err) {
                req.flash.error('Cập nhật product không thành công');
                next();
            })
        });
    });
}
_module.save = function (req, res) {
    //tao 2 nut save và back params(#1:request,#2folderofmodule,rule,url
    res.locals.backButton = __acl.addButton(req, module_name, 'index','/products');
    res.locals.saveButton = __acl.addButton(req, module_name, 'create');
    //lay du lieu tu form
    let data = req.body;
    //set thêm một số trường
    data.created_by = req.user.id;

    //console.log(data);
    //luu vao database
    __models.product.create(data).then(function (product) {
        let tag = product.categories;
        if (tag != null && tag != '') {
            tag = tag.split(':');
            tag.shift();
            tag.pop(tag.length - 1);
            Promise.map(tag, function (id) {
                return __models.product_category.findById(id).then(function (category) {
                    let count =category.count + 1;
                    return category.updateAttributes({
                        count: count
                    })
                });
            });
        }
        req.flash.success('Tạo mới sản phẩm thành công !');
        res.redirect('/admin/products/' + product.id);
    }).catch(function (err) {
        req.flash.error(err.message);
        res.redirect('/admin/products/create');
    });
}
_module.uploadImage = function (req, res) {
    //console.log('uploadImage');
    let form = new formidable.IncomingForm();
    form.uploadDir = __base+'/public/img/products/';
    form.keepExtensions = true;
    let path=__base+'/public/img/';
    if (!fs.existsSync(form.uploadDir)) {
        fs.mkdirSync(form.uploadDir, function (err) {
            console.log(err);
            res.send('error');
        });
    }
    form.parse(req, function (err, fields, files) {
        if (!err){
            var newPath = form.uploadDir + files.image.name;
            newPath = newPath.replace(/ /g,'_').toLowerCase();
            fs.rename(files.image.path, newPath, function (err) {
                if (err) {
                    res.end('cannot rename file ' + files.image.path);
                }
            });
            res.send('/img/products/'+files.image.name.replace(/ /g,'_').toLowerCase());
        }
        else
        res.send('error');
    })
}
_module.read = function (req, res, next, id) {
    __models.product.findById(id).then(function (product) {
        req.product = product;
        next();
    });
};
_module.delete_img = function (req, res) {
    let id_ = req.body.id;
    let result={id : id_,action : false};
    //console.log(req.body.url);
    fs.unlink(__base+'/public'+req.body.url, function(err) {
        if (err){
            //console.log('Co loi :'+err);
            res.send(result);
        }else{
            //console.log('Khong loi ----- ');
            result.action = true;
            res.send(result);
        }
    })

}
module.exports = _module;