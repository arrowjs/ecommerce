'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'users';

router.get('/users/signout', controller.signout);
router.get('/users/change-pass', __acl.isAllow( 'update_profile'), controller.changePass);
router.post('/users/change-pass', __acl.isAllow( 'update_profile'), controller.updatePass);
router.get('/users/profile/:cid',  __acl.isAllow( 'update_profile'), controller.profile);
router.post('/users/profile/:cid', __acl.isAllow( 'update', 'update_profile', controller.hasAuthorization), controller.update, controller.profile);

router.get('/users', __acl.isAllow( 'index'), controller.list);
router.get('/users/page/:page', __acl.isAllow( 'index'), controller.list);
router.get('/users/page/:page/sort/:sort/(:order)?', __acl.isAllow( 'index'), controller.list);

router.delete('/users', __acl.isAllow( 'delete'), controller.delete);
router.get('/users/create', __acl.isAllow( 'create'), controller.create);
router.post('/users/create', __acl.isAllow( 'create'), controller.save, controller.list);
router.route('/users/avatar').post(__acl.isAllow( 'update_profile'),controller.getAvatarGallery);
router.get('/users/:cid', __acl.isAllow( 'update'), controller.view);
router.post('/users/:cid', __acl.isAllow( 'update'), controller.update, controller.list);


router.param('cid', controller.userById);

module.exports = router;
