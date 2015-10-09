'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'plugins';

router.route('/plugins').get(__acl.isAllow( 'index'), controller.index);
router.route('/plugins/reload-plugins').get(__acl.isAllow( 'active'), controller.reload);
router.route('/plugins/import-plugins').post(__acl.isAllow( 'import'), controller.importPlugin);
router.route('/plugins/setting/:alias').get(__acl.isAllow( 'index'), controller.setting);
router.route('/plugins/setting/:alias').post(__acl.isAllow( 'index'), controller.save_setting, controller.setting);
router.route('/plugins/check-security/:alias').get(__acl.isAllow( 'active'), controller.checkSecurity);
router.route('/plugins/:alias').get(__acl.isAllow( 'active'), controller.active);

module.exports = router;
