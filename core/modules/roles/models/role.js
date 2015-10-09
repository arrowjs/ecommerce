"use strict";

module.exports = function (sequelize, DataTypes) {
    let Role = sequelize.define("role", {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        name: {
            type : DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len : {
                    args : [1,255],
                    msg : 'please input not too long'
                }
            }
        },
        rules: {
            type : DataTypes.STRING(2000),
            validate: {
                len : {
                    args : [1,2000],
                    msg : 'Please input not too long'
                }
            }
        },
        created_at: {
            type : DataTypes.DATE
        },
        created_by: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        modified_at: {
            type : DataTypes.DATE
        },
        modified_by: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        status: {
            type : DataTypes.STRING(15),
            validate : {
                isIn : {
                    args : [['publish', 'un-publish']],
                    msg : 'Please only input publish or un-publish'
                }
            }
        }

    }, {
        tableName: 'arr_role',
        createdAt: 'created_at',
        updatedAt: 'modified_at',
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                Role.hasMany(models.user, {foreignKey: 'role_id'});
            }
        }
    });
    Role.sync();
    return Role;
};