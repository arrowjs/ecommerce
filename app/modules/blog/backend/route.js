'use strict';

let express = require('express'),
    router = express.Router(),
    category = require('./controllers/category'),
    post = require('./controllers/post'),
    page = require('./controllers/page');

router.route('/blog').get(__acl.isAllow( 'post_index'), post.list);

router.route('/blog/categories').get(__acl.isAllow( 'category_index'), category.list)
    .delete(__acl.isAllow( 'category_delete'), category.delete);
router.route('/blog/categories/page/:page').get(__acl.isAllow( 'category_index'), category.list);
router.route('/blog/categories/page/:page/sort/:sort/(:order)?').get(__acl.isAllow( 'category_index'), category.list);
router.route('/blog/categories/create').post(__acl.isAllow( 'category_create'), category.save);
router.route('/blog/categories/:catId').post(__acl.isAllow( 'category_edit'), category.update);

router.get('/blog/posts/page/:page', __acl.isAllow( 'post_index'), post.list);
router.route('/blog/posts/page/:page/sort/:sort/(:order)?').get(__acl.isAllow( 'post_index'), post.list);
router.route('/blog/posts').get(__acl.isAllow( 'post_index'), post.list)
    .delete(__acl.isAllow( 'post_delete'), post.delete);
router.get('/blog/posts/create', __acl.isAllow( 'post_create'), post.create);
router.post('/blog/posts/create', __acl.isAllow( 'post_create'), post.save);
router.get('/blog/posts/:cid', __acl.isAllow( 'post_edit'), post.view);
router.post('/blog/posts/:cid', __acl.isAllow( 'post_edit_all', 'post_edit', post.hasAuthorization), post.update, post.view);
router.param('cid', post.read);

router.get('/blog/pages', __acl.isAllow( 'page_index'), page.list);
router.get('/blog/pages/page/:page', __acl.isAllow( 'page_index'), page.list);
router.route('/blog/pages/page/:page/sort/:sort/(:order)?').get(__acl.isAllow( 'page_index'), page.list);
router.delete('/blog/pages', __acl.isAllow( 'page_delete'), page.delete);
router.get('/blog/pages/create', __acl.isAllow( 'page_create'), page.create);
router.post('/blog/pages/create', __acl.isAllow( 'page_create'), page.save);
router.get('/blog/pages/:cid([0-9]+)', __acl.isAllow( 'page_edit'), page.view);
router.post('/blog/pages/:cid([0-9]+)', __acl.isAllow( 'page_edit'), page.update, page.view);
router.get('/blog/pages/:name', __acl.isAllow( 'page_edit'), page.redirectToView);

module.exports = router;