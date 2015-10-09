'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

let _module = new FrontModule;

_module.list = function (req, res) {
    let month_ = req.params.month || '01';
    let year_ = req.params.year || '2000';
    let page = req.params.page || 1;
    let number_item = __config.pagination.number_item || 5;

    let sql = 'select posts.*,users.user_login,users.user_pass,users.user_email,users.user_url,users.user_registered,users.display_name,' +
        'users.user_activation_key,users.user_image_url,users.salt,users.user_status,users.phone ' +
        'from arr_post as posts left outer join arr_user as users on posts.created_by = users.id WHERE' +
        ' "posts"."type" = \'post\' AND "posts"."published" = 1 AND EXTRACT(MONTH FROM posts.created_at ) = ' + month_ + ' AND EXTRACT(YEAR FROM posts.created_at) = ' + year_ +
        ' ORDER BY posts.id ASC OFFSET ' + (page - 1) * number_item + ' LIMIT ' + __config.pagination.number_item;

    __models.sequelize.query(sql)
        .then(function (result) {
            let totalPage = Math.ceil(result[0].count / number_item);
            if (result) {
                // Render view
                _module.render(req, res, 'archives', {
                    posts: result[0],
                    archives_date: year_ + ' ' + month_,
                    totalPage: totalPage,
                    currentPage: page
                });
            } else {
                // Redirect to 404 if post not exist
                _module.render404(req, res);
            }
        }).catch(function (err) {
            console.log(err.stack);
        });
};

module.exports = _module;