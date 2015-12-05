/**
 * Created by thangnv on 8/31/15.
 */
"use strict";
let fs = require('fs');
module.exports = {
    handler: function (imgs, index) {
        let result;
        if (!index)index = 0;
        if (imgs != null && imgs != '') {
            result = imgs.split(':::')[index];
            if (!fs.existsSync(__base + 'upload' + result))
                result = '/img/noImage.jpg'
        } else {
            result = '/img/noImage.jpg'
        }
        return result;
    }
};
