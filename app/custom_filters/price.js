/**
 * Created by thangnv on 7/2/15.
 */
    "use strict";

module.exports = function (env) {
    env.addFilter('price', function (price,sym,digit) {
        price = price.toString().split(/\,|\./ig).shift();
        let result='';
        if (!digit)digit='.';
        if (price.match(/[0-9]+/)){
            let count = 0;
            for (let i = price.length-1 ; i >= 0 ; i--){
                if(count%3==0&&count!=0){
                    result+= (digit+price[i]);
                }else{
                    result+=price[i];
                }
                count++;
            }
            price = '';
            for (let i = result.length-1 ; i >= 0 ; i--){
                price+=result[i];
            }
        }
        return price+sym;
    })
};


