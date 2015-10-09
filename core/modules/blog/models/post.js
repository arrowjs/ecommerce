"use strict";

module.exports = function (sequelize, DataTypes) {
    let Posts = sequelize.define("post", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                isInt: {
                    msg: 'ID must be an integer number'
                }
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 255],
                    msg: 'Title cannot empty or too long'
                }
            }
        },
        alias: {
            type: DataTypes.STRING(255),
            unique: true,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'Alias is too long'
                },
                isAlias: function (value) {
                    if (typeof value !== 'string' || value.match(__config.regExp.alias_reg)) {
                        throw new Error('Alias cannot includes special characters');
                    }
                }
            }
        },
        intro_text: DataTypes.TEXT,
        full_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(255),
            len: {
                args: [0, 255],
                msg: 'Image is too long'
            }
        },
        published: {
            type: DataTypes.INTEGER,
            validate: {
                isIn: {
                    args: [['0', '1']],
                    msg: 'Invalid data type'
                }
            }

        },
        published_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Please input datetime value'
                }
            }
        },
        categories: {
            type: DataTypes.TEXT
        },
        type: {
            type: DataTypes.STRING(15),
            len: {
                args: [1, 15],
                msg: 'Invalid data type'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Please input datetime value'
                }
            }
        },
        created_by: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value'
                }
            },
            allowNull: false
        },
        modified_at: {
            type: DataTypes.DATE,
            validate: {
                isDate: {
                    msg: 'Please input datetime value'
                }
            }
        },
        modified_by: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: {
                    msg: 'Please input integer value'
                }
            }
        },
        author_visible: {
            type: DataTypes.BOOLEAN,
            isIn: {
                args: [['0', '1', 0, 1, true, false]],
                msg: 'Please input valid value of author_visible'
            }
        }
    }, {
        tableName: 'arr_post',
        createdAt: 'created_at',
        updatedAt: 'modified_at',
        classMethods: {
            associate: function (models) {
                Posts.belongsTo(models.user, {foreignKey: 'created_by'});
            }
        }
    });

    Posts.sync();
    return Posts;
};