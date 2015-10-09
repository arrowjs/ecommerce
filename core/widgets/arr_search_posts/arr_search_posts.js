"use strict";

var _ = require('lodash'),
    Promise = require('bluebird');

class SearchPosts extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_search_posts",
            name: "Search posts",
            description: __.t('m_widgets_search_posts'),
            author: "Robin",
            version: "0.1.0",
            options: {
                id: '',
                title: '',
                placeholder: '',
                button_name: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }

    save(data, done) {
        let base_save = super.save;

        if (data.button_name.length == 0) {
            data.button_name = 'Search';
        }

        return base_save.call(this, data, done);
    }
}

module.exports = SearchPosts;