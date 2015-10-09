'use strict';

let _ = require('lodash');

class CustomHtml extends BaseWidget {
    constructor() {
        super();

        let conf = {
            alias: "arr_custom_html",
            name: "Custom HTML",
            description: __.t('m_widgets_custom_html'),
            author: "Nguyen Van Thanh",
            version: "0.1.0",
            options: {
                title: '',
                content: ''
            }
        };
        conf = _.assign(this.config, conf);

        this.files = this.getAllLayouts(conf.alias);
    }
}

module.exports = CustomHtml;
