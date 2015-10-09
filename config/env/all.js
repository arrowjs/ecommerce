'use strict';

module.exports = {
    key: 'site_setting',
    redis_prefix: 'arrowjs_',
    app: {
        language: 'en_US',
        title: 'ArrowJS',
        description: '',
        keywords: '',
        logo: '',
        icon: ''
    },
    admin_prefix: 'admin',
    date_format: 'Y-m-d',
    number_format: {
        thousand: '.',
        decimal: ',',
        length: 2,
        header: '',
        footer: '$'
    },
    mailer_config: {
        service: 'Gmail',
        auth: {
            user: 'test@gmail.com',
            pass: 'secret'
        },
        mailer_from: "Techmaster <support@techmaster.vn>",
        mailer_to: "admin@techmaster.vn"
    },
    pagination: {
        number_item: 20
    },
    port: process.env.PORT || 3000,
    templateEngine: 'nunjucks',
    sessionSecret: 'GREEN',
    sessionCollection: 'sessions',
    theme: 'eshopper',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css'
            ]
        }
    },
    resource : {
        path : 'public',
        option : {
            redirect: false
        }
    },
    bodyParser : {
        extended: true,
        limit: '5mb'
    },
    regExp : {
        name_reg : /[+-.,!@#$%^&*();\/|<>"'\\]/g,
        title_reg : /[+.@#$%^&*();\/|<>"'\\]/g,
        alias_reg : /[+_.,!@#$%^&*();\/|<>"'\\ ]/g,
        categories_reg : /^[\:0-9]*$/g, // like : :123:234:345:
        type_reg : /^[a-z]$/ig,
        username_reg : /^[a-z0-9_-]+$/ig,
        display_name_reg : /[+.,!@#$%^&*();\/|<>"'\\]/g,
        phone_reg : /^\d{9,11}$/ig
    }
};