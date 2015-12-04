'use strict';

module.exports = {
    /**
     * Uncomment to override config in development environment
     */
    port: process.env.PORT || 8000,
    db: {
        host: 'localhost',
        port: '5432',
        database: 'shop',
        username: 'thangnv',
        password: 'admin',
        dialect: 'postgres',
        logging: false
    },
    redis: {
        host: 'localhost',
        port: '6379'
    }
};
