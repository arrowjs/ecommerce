/**
 * Created by thangnv on 7/28/15.
 */
'use strict';
module.exports = function (sequelize,DataTypes) {
    return sequelize.define('product',{
        id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true,
            validate : {
                isInt : {
                    msg : 'please input integer value ID'
                }
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull : false,
        },
        desc: DataTypes.TEXT,
        content: {
            type: DataTypes.TEXT,
            allowNull : false
        },
        images: {
            type : DataTypes.TEXT,
        },
        quantity: {
            defaultValue : 0,
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Hãy nhập đúng giá trị của "số lượng"<br>'
                }
            }
        },
        price : {
            type : DataTypes.INTEGER,
            defaultValue : 0,
            validate : {
                isInt : {
                    msg : 'Hãy nhập đúng giá trị của giá sản phẩm'
                }
            }
        },
        price_sale : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        categories: {
            type : DataTypes.TEXT,
            validate : {
                //is : __config.regExp.categories_reg
            }
        },
        type : {
            type : DataTypes.STRING(15),
            len : {
                args : [1,15],
                msg : 'please input not too long type'
            },
            isValid : function (value) {
                if (typeof value !== 'string' || !value.match()){
                    throw new Error('Please input valid value');
                }
            }
        },
        status : {
            type :  DataTypes.INTEGER
        },
        count_views : {
            type : DataTypes.INTEGER
        },
        created_at: {
            type : DataTypes.DATE,
            validate : {
                isDate : {
                    msg : 'Please input datetime value'
                }
            }
        },
        created_by: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'please input integer value'
                }
            },
            allowNull : false
        },
        modified_at: {
            type : DataTypes.DATE,
            validate : {
                isDate : {
                    msg : 'Please input datetime value'
                }
            }
        },
        modified_by: {
            type : DataTypes.INTEGER,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        }

    },{
        tableName: 'product',
        createdAt: 'created_at',
        updatedAt: 'modified_at'
    });
};