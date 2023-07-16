import db from "./index.js";

// @create user model
export const User = db.sequelize.define("user", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: db.Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: db.Sequelize.STRING,
        allowNull : false
    },
    email: {
        type : db.Sequelize.STRING,
    },
    tempEmail: {
        type : db.Sequelize.STRING,
    },
    phone : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    role : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 2
    },
    isVerified : {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    imgProfile: {
        type : db.Sequelize.STRING,
        // allowNull : false
    }
},{
    timestamps : false
})
