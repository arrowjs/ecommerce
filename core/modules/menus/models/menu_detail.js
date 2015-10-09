'use strict';

module.exports = function (sequelize, DataTypes) {
    let MenuDetail = sequelize.define("menu_detail", {
        menu_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            isInt: {
                msg: 'please input a number'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attribute: {
            type: DataTypes.STRING(25),
            validate: {
                len: {
                    args: [0, 25],
                    msg: 'Please input not too long'
                }
            }
        },
        link: {
            type: DataTypes.STRING(25),
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Please input link not too long'
                }
            }
        },
        parent_id: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value parent_id'
                }
            }
        },
        created_at: {
            type: DataTypes.DATE
        },
        created_by: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value created_by'
                }
            }
        },
        modified_at: {
            type: DataTypes.DATE
        },
        modified_by: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value modified_by'
                }
            }
        }
    }, {
        tableName: 'arr_menu_detail',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "modified_at",
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                MenuDetail.belongsTo(models.menus, {foreignKey: 'menu_id'});
                MenuDetail.belongsTo(models.user, {foreignKey: 'created_by'});
                MenuDetail.belongsTo(models.user, {foreignKey: 'modified_by'});
            }
        }
    });
    MenuDetail.sync();
    return MenuDetail;
};
