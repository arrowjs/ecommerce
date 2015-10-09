'use strict';

module.exports = function (modules) {
    modules.uploads = {
        title: __.t('m_upload_backend_module_title'),
        author: 'Nguyen Van Thanh',
        version: '0.1.1',
        description: __.t('m_upload_backend_module_desc'),
        rules: []
    };

    return modules;
};

