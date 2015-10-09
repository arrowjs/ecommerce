"use strict";

var dateformatter = require('arrowjs/dateformatter');

module.exports = function (env) {
    env.addFilter('date', function (input, format, offset, abbr) {
        let l = format.length,
            date = new dateformatter.DateZ(input),
            cur,
            i = 0,
            out = '';

        if (offset) {
            date.setTimezoneOffset(offset, abbr);
        }

        for (i; i < l; i += 1) {
            cur = format.charAt(i);
            if (dateformatter.hasOwnProperty(cur)) {
                out += dateformatter[cur](date, offset, abbr);
            } else {
                out += cur;
            }
        }
        return out;
    });
};
