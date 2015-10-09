'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'modules';

router.route('/modules').get(__acl.isAllow( 'index'), controller.index);
router.route('/modules/reload-modules').get(__acl.isAllow( 'active'), controller.reload);
router.route('/modules/import-modules').post(__acl.isAllow( 'import'), controller.importModule);
router.route('/modules/check-security/:alias').get(__acl.isAllow( 'active'), controller.checkSecurity);
router.route('/modules/:alias').get(__acl.isAllow( 'active'), controller.active);

module.exports = router;
