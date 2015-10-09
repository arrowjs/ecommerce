/**
 * Created by thangnv on 8/14/15.
 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    let order = sequelize.define("order", {
        id : {
            type : DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone:{
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type :   DataTypes.STRING
        },
        products : {
            type : DataTypes.JSON
        },
        status : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        total_bill : {
            type : DataTypes.INTEGER
        },
        created_at: {
            type : DataTypes.DATE
        },
    }, {
        tableName: 'order',
        createdAt: 'created_at'
    });
    order.sync();
    return order;
};