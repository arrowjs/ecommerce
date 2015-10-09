'use strict';

module.exports = function (sequelize, DataTypes) {
    let Menu = sequelize.define("menus", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                isInt: {
                    msg: 'Please input integer value'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        menu_order: {
            type: DataTypes.STRING
        },
        created_at: {
            type: DataTypes.DATE
        },
        created_by: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value'
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
                    msg: 'Please input integer value'
                }
            }
        }
    }, {
        tableName: 'arr_menu',
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "modified_at",
        deletedAt: false,
        classMethods: {
            associate: function (models) {
                Menu.hasMany(models.menu_detail, {foreignKey: 'id'});
                Menu.belongsTo(models.user, {foreignKey: 'created_by'});
                Menu.belongsTo(models.user, {foreignKey: 'modified_by'});
            }
        }
    });
    Menu.sync();
    return Menu;
};
