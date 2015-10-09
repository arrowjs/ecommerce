'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'menus';

router.route('/menus').get(__acl.isAllow( 'index'), controller.index);
router.get('/menus/sort/:sort/:order', __acl.isAllow( 'index'), controller.index);
router.route('/menus').delete(__acl.isAllow( 'delete'),controller.delete);
router.route('/menus/create').get(__acl.isAllow( 'create'), controller.create);
router.route('/menus/create').post(__acl.isAllow( 'create'), controller.save);
router.route('/menus/update/:cid').get(__acl.isAllow( 'update'),controller.read);
router.route('/menus/update/:cid').post(__acl.isAllow( 'update'), controller.update);
router.get('/menus/sort-admin-menu', __acl.isAllow( 'update'), controller.sortAdminMenu);
router.post('/menus/sort-admin-menu', __acl.isAllow( 'update'), controller.saveSortAdminMenu);
router.param('cid', controller.menuById);

module.exports = router;
