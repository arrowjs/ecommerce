'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

let _module = new FrontModule;

_module.listPostByCategory = function (req, res) {
    let page = req.params.page || 1;
    let number_item = __config.pagination.number_item || 5;

    promise.all([
        __models.post.findAndCountAll({
            include: [
                {
                    model: __models.user,
                    attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
                }
            ],
            where: {
                categories: {$like: '%:' + req.params.id + ':%'},
                type: 'post',
                published: 1
            },
            order: 'id ASC',
            offset: (page - 1) * number_item,
            limit: __config.pagination.number_item
        }),
        __models.category.findAll({
            order: 'id ASC'
        }),
        __models.category.findById(req.params.id)
    ]).then(function (result) {
        let totalPage = Math.ceil(result[0].count / number_item);

        if (result) {
            // Render view
            _module.render(req, res, 'category', {
                posts: result[0].rows,
                category: result[2],
                categories: result[1],
                totalPage: totalPage,
                currentPage: page
            });
        } else {
            //Redirect to 404 if post not exist
            _module.render404(req, res);
        }
    }).catch(function (err) {
        console.log(err.stack);
    });
};

module.exports = _module;