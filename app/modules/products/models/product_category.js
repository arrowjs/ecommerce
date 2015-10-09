/**
 * Created by thangnv on 8/6/15.
 */
'use strict';

let slug = require('slug');

module.exports = function (sequelize, DataTypes) {
    let product_category = sequelize.define("product_category", {
        id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },
        count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate : {
                isInt : {
                    msg : 'Please input integer value'
                }
            }
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        alias: {
            type :   DataTypes.STRING,
            validate : {
                isValid : function (value) {
                    if (typeof value !== 'string' || value.match(__config.regExr.alias_reg)){
                        throw new Error('Please input valid value');
                    }
                }
            }
        }
    }, {
        tableName: 'product_category',
        timestamps: false,
        hooks: {
            beforeCreate: function (product_category, op, fn) {
                product_category.alias = slug(product_category.name).toLowerCase();
                fn(null, product_category);
            }
        }
    });
    product_category.sync();
    return product_category;
};