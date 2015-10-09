/**
 * Created by thangnv on 8/11/15.
 */
"use strict";

/** Create pagination */
module.exports = function (env) {
    env.addFilter('pagination_front', function (totalPage, current_page, link) {
        let s=1,e=5
        if (current_page > 2 && totalPage > 5){
            s = +current_page - 2;
            if(current_page < +totalPage - 2)
                e = +current_page + 2;
            else
                e = totalPage
        }
        let html ='';
        if (totalPage > 1){
            html +=  '<ul class="pagination">';
            if (current_page != 1){
                html +='<li><a href="'+link.replace('{page}',1)+'">«</a></li>';
            }
            for (let i = s ; i <= e ; i++){
                if (i == current_page){
                    html += '<li class="active"><a href="#">'+i+'</a></li>';
                }else {
                    html += '<li><a href="'+link.replace('{page}',i)+'">'+i+'</a></li>';
                }
            }
            if (current_page != totalPage){
                html +='<li><a href="'+link.replace('{page}',totalPage)+'">»</a></li>';
            }
            html += '</ul>';
        }
        return html;
    });
};
