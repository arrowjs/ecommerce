'use strict';

let _ = require('lodash'),
    promise = require('bluebird');

var _module = new FrontModule;

_module.index = function (req, res) {
    __models.post.find({
        include: [
            {
                model: __models.user,
                attributes: ['id', 'display_name', 'user_login', 'user_email', 'user_image_url']
            }
        ],
        where: {
            alias: req.params.alias,
            type: 'page',
            published: 1
        }
    }).then(function (results) {
        if (results) {
            // Render view
            _module.render(req, res, 'page.html', {
                item: results
            });
        } else {
            // Redirect to 404 if page not exist
            _module.render404(req, res);
        }
    });
};

module.exports = _module;