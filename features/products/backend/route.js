'use strict';

/**
 * Map final part of URL to equivalent functions in controller
 */
module.exports = function (component, application) {
    let comp = component.controllers.backend;
    return {
        // route products
        "/products": {
            get: {
                handler: comp.productList,
                authenticate: true,
                permissions: "index"
            }
        },
        "/products/page/:page": {
            get: {
                handler: comp.productList,
                authenticate: true,
                permissions: "index"
            }
        },
        "/products/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: comp.productList,
                authenticate: true,
                permissions: "index"
            }
        },
        "/products/create": {
            get: {
                handler: comp.productCreate,
                authenticate: true,
                permissions: "create"
            },
            post: {
                handler: comp.productSave,
                authenticate: true,
                permissions: "create"
            }
        },
        "/products/upload-image": {
            post: {
                handler: comp.productUploadImage,
                authenticate: true,
                permissions: "create"
            }
        },
        "/products/delete-image": {
            delete: {
                handler: comp.productDeleteImage,
                authenticate: true,
                permissions: 'delete'
            }
        },
        "/products/delete": {
            delete: {
                handler: comp.productDelete,
                authenticate: true,
                permissions: 'delete'
            }
        },

        //route category
        "/products/categories": {
            get: {
                handler: comp.categoryList,
                authenticate: true,
                permissions: 'category_index'
            },
            delete: {
                handler: comp.categoryDelete,
                authenticate: true,
                permissions: 'category_delete'
            }
        },
        "/products/categories/page/:page": {
            get: {
                handler: comp.categoryList,
                authenticate: true,
                permissions: 'category_index'
            }
        },
        "/products/categories/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: comp.categoryList,
                authenticate: true,
                permissions: 'category_index'
            }
        },
        "/products/categories/create": {
            post: {
                handler: comp.categorySave,
                authenticate: true,
                permissions: 'category_create'
            }
        },
        "/products/categories/:catId":{
            post: {
                handler: comp.categoryUpdate,
                authenticate: true,
                permissions: 'category_edit'
            }
        },
        "/products/:pid([0-9]+)": {
            get: {
                handler: comp.productView,
                authenticate: true,
                permissions: 'edit'
            },
            post: {
                handler: [comp.productUpdate, comp.productView],
                authenticate: true,
                permissions: 'edit'
            },
            param: {
                key: 'pid',
                handler: comp.productRead
            }
        },

        //route order
        "/products/order/:pid([0-9]+)": {
            get: {
                handler: comp.orderView,
                authenticate: true,
                permissions: 'order'
            },
            post: {
                hander: comp.orderUpdate,
                authenticate: true,
                permissions: 'order'
            }
        },
        "/products/order": {
            get: {
                handler: comp.orderList,
                authenticate: true,
                permissions: 'order'
            }
        },
        "/products/order/page/:page": {
            get: {
                handler: comp.orderList,
                authenticate: true,
                permissions: 'order'
            }
        },
        "/products/order/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: comp.orderList,
                authenticate: true,
                permissions: 'order'
            }
        }
    }
};