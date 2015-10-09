"use strict";

var slug = require('slug');

module.exports = function (env) {
    env.addFilter('slug', function (input) {
        let val = '';
        if (input != null)
            val = slug(input);
        else
            val = '';
        if (val === '' || val === null){
            return input.split(' ');
        }else{
            return val;
        }
    });
};
