'use strict';

let express = require('express');
let router = express.Router();
let controller = require('./controllers/index.js');
let moduleName = 'widgets';

router.route('/widgets').get(__acl.isAllow( 'index'), controller.index);
router.route('/widgets/import-widgets').post(__acl.isAllow( 'import'), controller.importWidget);

router.route('/widgets/sidebars').get(__acl.isAllow( 'index'), controller.sidebar);
router.route('/widgets/sidebars/clear').get(__acl.isAllow( 'index'), controller.clear_sidebar_cache);
router.route('/widgets/sidebars/sort').post(__acl.isAllow( 'index'), controller.sidebar_sort);
router.route('/widgets/sidebars/add/:widget').get(__acl.isAllow( 'index'), controller.addWidget);
router.route('/widgets/sidebars/save').post(__acl.isAllow( 'index'), controller.saveWidget);
router.route('/widgets/sidebars/:cid').get(__acl.isAllow( 'index'), controller.read);
router.route('/widgets/sidebars/:cid').delete(__acl.isAllow( 'index'), controller.delete);

module.exports = router;
