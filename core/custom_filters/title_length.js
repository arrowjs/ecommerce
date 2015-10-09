/**
 * Created by thangnv on 7/2/15.
 * filter cut String to long to display on website without html tag
 * filter also add more string at the end of string (like more...)
 * $length : length of string after cut
 * $lastStr : string or word to display at the end of string
 */
    "use strict";

module.exports = function (env) {
    env.addFilter('title_length', function (input,length,lastStr) {
        var regex = /(<([^>]+)>)/ig;
        let result =  input.replace(regex, "");
        if(length > 0){
            result = result.substring(0,length);
        }
        if(lastStr!=null && input.length > length ){
            result = result.substring(0,result.lastIndexOf(' '));
            result+=' '+lastStr;
        }
        return result;
    })
};