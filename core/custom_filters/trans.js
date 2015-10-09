"use strict";

module.exports = function (env) {
    env.addFilter('trans', function () {
        return __.t.apply(this, arguments);
    })
};