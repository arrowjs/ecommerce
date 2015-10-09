'use strict';

var _ = require('lodash'),
    Promise = require('bluebird');

class Categories extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "products_categories",
            name: "Categories (product)",
            description: 'Hiển thị tất cả danh mục của sản phẩm',
            author: "thangnv",
            version: "0.0.1",
            options: {
                title: ''
            }
        };

        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    render(widget) {
        let base_render = super.render;
        let self = this;
        //console.log('arr_categories');
        return new Promise(function (resolve) {
            __models.product_category.findAll({
                order: "name ASC"
            }).then(function (categories) {
                console.log(JSON.stringify(categories));
                resolve(base_render.call(self, widget, {
                    items: categories
                }));
            });
        })
    }
}

module.exports = Categories;
