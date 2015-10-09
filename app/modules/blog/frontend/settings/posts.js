'use strict';

module.exports = function (app, config) {
    let alias = 'posts';

    app.route('/_menus/' + alias + '/page/:page').get(function (req, res) {
        if (req.isAuthenticated()) {
            // Get page and keyword to search
            let page = req.params.page || 1;
            let s = req.query.s;

            // Set conditions
            let conditions = "type='post' AND published = 1";
            if (s != '') conditions += " AND title ilike '%" + s + "%'";

            // Find all posts with page and search keyword
            __models.post.findAndCount({
                attributes: ['id', 'alias', 'title'],
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
                    title_column: 'title',
                    link_template: '/posts/{id}/{alias}'
                });
            });
        }
        else {
            res.send(__.t("not_authenticated"));
        }
    });

    return {
        title: 'Posts',
        alias: alias,
        search: true
    };
};
