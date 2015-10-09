'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'roles';

router.get('/roles', __acl.isAllow( 'index'), controller.list);
router.get('/roles/sort/:sort/:order', __acl.isAllow( 'index'), controller.list);
router.delete('/roles', __acl.isAllow( 'delete'), controller.delete);
router.get('/roles/create', __acl.isAllow( 'create'), controller.create);
router.post('/roles/create', __acl.isAllow( 'create'), controller.save, controller.list);
router.get('/roles/:cid', __acl.isAllow( 'update'), controller.view);
router.post('/roles/:cid', __acl.isAllow( 'update'), controller.update, controller.list);

module.exports = router;
