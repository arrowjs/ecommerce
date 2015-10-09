'use strict';

module.exports = function (app, config) {
    let alias = 'product_category';

    app.route('/_menus/' + alias + '/page/:page').get(function (req, res) {
        if (req.isAuthenticated()) {
            // Get page and keyword to search
            let page = req.params.page || 1;
            let s = req.query.s;

            // Set conditions
            let conditions = "1 = 1";
            if (s != '') conditions += " AND name ilike '%" + s + "%'";

            __models.product_category.findAndCountAll({
                attributes: ['id', 'name'],
                where: [conditions],
                limit: 10,
                offset: (page - 1) * 10,
                raw: true
            }).then(function (results) {
                let totalRows = results.count;
                let items = results.rows;
                let totalPage = Math.ceil(results.count / 10);

                // Send json response
                res.jsonp({
                    totalRows: totalRows,
                    totalPage: totalPage,
                    items: items,
                    title_column: 'name',
                    link_template: '/products/{id}'
                });
            });
        }
        else {
            res.send(__.t("not_authenticated"));
        }
    });

    return {
        title: 'Categories (products)',
        alias: alias,
        search: true
    };
};
