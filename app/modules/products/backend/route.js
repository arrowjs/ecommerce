/**
 * Created by thangnv on 7/28/15.
 */
'use strict';

let express = require('express'),
    router = express.Router(),
    product = require('./controllers/product'),
    category = require('./controllers/category'),
    order = require('./controllers/order');

router.route('/products').get(__acl.isAllow('index'),product.list);
router.route('/products/page/:page').get(__acl.isAllow( 'index'), product.list);
router.route('/products/page/:page/sort/:sort/(:order)?').get(__acl.isAllow( 'index'), product.list);

router.route('/products/create').get( __acl.isAllow( 'create'),product.create)
    .post( __acl.isAllow( 'create'), product.save);
//router.post('/products/create', __acl.isAllow( 'create'), product.save);
router.post('/products/upload-image', __acl.isAllow( 'create'), product.uploadImage);

router.delete('/products/delete-image', __acl.isAllow( 'create'), product.delete_img);
router.delete('/products/delete', __acl.isAllow( 'delete'), product.delete);


router.route('/products/categories').get(__acl.isAllow( 'category_index'), category.list)
    .delete(__acl.isAllow( 'category_delete'), category.delete);
router.route('/products/categories/page/:page').get(__acl.isAllow( 'category_index'), category.list);
router.route('/products/categories/page/:page/sort/:sort/(:order)?').get(__acl.isAllow( 'category_index'), category.list);
router.route('/products/categories/create').post(__acl.isAllow( 'category_create'), category.save);
router.route('/products/categories/:catId').post(__acl.isAllow( 'category_edit'), category.update);
//
router.get('/products/:pid([0-9]+)', __acl.isAllow( 'edit'), product.view);
router.post('/products/:pid([0-9]+)', __acl.isAllow( 'edit'), product.update,product.view);
router.param('pid', product.read);


//router.delete('/products/:pid([0-9]+)', __acl.isAllow( 'delete'), product.delete);

router.route('/products/order/:pid([0-9]+)')
    .get(__acl.isAllow('order'), order.view)
    .delete(__acl.isAllow('order'),order.delete)
    .post(__acl.isAllow('order'),order.update);
router.route('/products/order').get(__acl.isAllow('order'), order.list);
router.route('/products/order/page/:page').get(__acl.isAllow('order'), order.list);
router.route('/products/order/page/:page/sort/:sort/(:order)?').get(__acl.isAllow('order'), order.list);


module.exports = router;