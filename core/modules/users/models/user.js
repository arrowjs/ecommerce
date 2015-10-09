"use strict";
let crypto = require('crypto');

module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define("user", {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            validate : {
                isInt : {
                    msg : 'please input integer value'
                }
            }
        },
        user_login: {
            type : DataTypes.STRING(60),
            allowNull : false,
            validate: {
                len : {
                    args : [1,60],
                    msg : 'please input not too long'
                },
                isName : function (value) {
                    if (typeof value !== 'string' || !value.match(__config.regExp.username_reg)){
                        throw new Error('Please input valid value user_login');
                    }
                }
            }
        },
        user_pass: {
            type : DataTypes.STRING(255),
            allowNull : false,
            validate: {
                len : {
                    args : [6,255],
                    msg : 'Password must be greater than 6 characters'
                }
            }
        },
        user_email: {
            type : DataTypes.STRING(100),
            validate : {
                isEmail: {
                    msg : 'Please input valid Email'
                }
            }
        },
        user_url: {
            type : DataTypes.STRING(100),
            validate : {
                isUrl: {
                    msg : 'Please input valid Url'
                }

            }
        },
        user_registered: {
            type : DataTypes.DATE,
            validate : {
                isDate : {
                    msg : 'Please input datetime value'
                }
            }
        },
        user_activation_key: {
            type : DataTypes.STRING(60),
            validate : {
                len : {
                    args : [0,60],
                    msg : 'Please don\'t input too long'
                }
            }
        },
        user_status: {
            type : DataTypes.STRING(15),
            validate : {
                isIn : {
                    args : [['publish', 'un-publish']],
                    msg : 'Please only input publish or un-publish'
                }
            }
        },
        display_name: {
            type : DataTypes.STRING(250),
            validate : {
                len : {
                    args : [0,250],
                    msg : 'Please don\'t input too long'
                }
            }
        },
        phone: {
            type : DataTypes.STRING
        },
        user_image_url: {
            type : DataTypes.TEXT
        },
        salt: {
            type : DataTypes.STRING(255),
            validate : {
                len : {
                    args : [0,255],
                    msg : 'please input salt not too long'
                }
            }
        },
        role_id: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'please input integer value role_id'
                }
            }
        },
        reset_password_expires: {
            type : DataTypes.BIGINT
        },
        reset_password_token: {
            type : DataTypes.STRING
        }
    }, {
        timestamps: false,
        tableName: 'arr_user',
        classMethods: {
            associate: function (models) {
                User.hasMany(models.menus, {foreignKey: 'id'});
                User.hasMany(models.menu_detail, {foreignKey: 'id'});
                User.belongsTo(models.role, {foreignKey: 'role_id'});
            }
        },
        instanceMethods: {
            authenticate: function (password) {
                return this.user_pass === this.hashPassword(password);
            },
            hashPassword: function (password) {
                if (this.salt && password) {
                    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
                } else {
                    return password;
                }
            }
        },
        hooks: {
            beforeCreate: function (user, op, fn) {
                user.salt = randomid(50);
                user.user_pass = user.hashPassword(user.user_pass);
                fn(null, user);
            }
        }
    });
    User.sync();
    return User;
};

let randomid = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};