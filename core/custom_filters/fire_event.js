"use strict";
var event = require('arrowjs/eventManager');
module.exports = function (env) {
    env.addFilter('fire_event', function (input, data, cb) {
        event.fire_event(input, data, cb);
    }, true);
};
