"use strict";
/**
 * Created by vhchung on 6/29/15.
 */
let moment = require('moment');

module.exports = function (env) {
    env.addFilter('moment', function (input, format) {
        // read about format string at: http://momentjs.com/docs/#/displaying/format/
        return moment(input).format(format);
    });
};
