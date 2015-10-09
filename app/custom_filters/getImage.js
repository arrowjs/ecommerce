/**
 * Created by thangnv on 8/31/15.
 */
"use strict";
let fs= require('fs');
module.exports = function (env) {
    env.addFilter('getImage', function (imgs,index) {
        let result;

        if (!index)index=0;
        if (imgs!=null && imgs!=''){
            result = imgs.split(':::')[index];
            if (!fs.existsSync(__base+'public'+result))
                result = '/theme_resources/frontend/Eshopper/images/no-image.jpg'
        }else{
            result = '/theme_resources/frontend/Eshopper/images/no-image.jpg'
        }
        return result;
    })
};
