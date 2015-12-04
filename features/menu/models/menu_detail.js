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
        modified_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'arr_menu_detail',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "modified_at",
        deletedAt: false
    });
    return MenuDetail;
};
