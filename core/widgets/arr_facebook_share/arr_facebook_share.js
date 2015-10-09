'use strict';

var _ = require('lodash');

class FacebookShare extends BaseWidget {
    constructor(){
        super();
        let conf = {
            alias: "arr_facebook_share",
            name: "Facebook Share",
            description: __.t('m_widgets_facebook_share'),
            author: "Robin Huy",
            version: "0.1.0",
            options: {
                layout_type: ''
            }
        };
        conf = _.assign(this.config, conf);
        this.files = this.getAllLayouts(conf.alias);
    }
}

module.exports = FacebookShare;