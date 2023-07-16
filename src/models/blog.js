import db from "./index.js";

export const Category = db.sequelize.define("category", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name : {
        type : db.Sequelize.STRING,
        allowNull : false
    }

},{
    timestamps : false
})

export const Like_Blog = db.sequelize.define("like_blog", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // idBlog : {
    //     type : db.Sequelize.INTEGER,
    //     allowNull : false
    // },
    // idUser : {
    //     type : db.Sequelize.INTEGER,
    //     allowNull : false
    // }

},{
    timestamps : false
})


//ada blog, category, dll sesuaiin aja 
export const Blog = db.sequelize.define("blog",{
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    content : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    thumbnail : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    url : {
        type : db.Sequelize.STRING,
    },
    // idCategory : {
    //     type: db.Sequelize.INTEGER,
    //     allowNull : false
    // },
    keywords : {
        type : db.Sequelize.STRING,
    },
    // idUser : {
    //     type: db.Sequelize.INTEGER,
    //     allowNull : false
    // },
    country : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    dateCreated : {
        type : db.Sequelize.DATE,
        allowNull : false
    }
},{
      // don't forget to enable timestamps!
  timestamps: true,

  // I don't want createdAt
  createdAt: 'dateCreated',

  // I want updatedAt to actually be called updateTimestamp
  updatedAt: false
})