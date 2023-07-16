import { User } from "./user.js";
import { Category,Like_Blog,Blog} from "./blog.js"

// @define relation
//user bs banyak blog
User.hasMany(Blog)
//1 blog 1 user
Blog.belongsTo(User, {as : "user"})//, { foreignKey : "idUser" }

//1 user bs banyak like blog
User.hasMany(Like_Blog)
//1 like blog bs 1 user
Like_Blog.belongsTo(User, {as : "user"})//, { foreignKey : "idUser" }

//1 blog bs banyaklike blog
Blog.hasMany(Like_Blog)
//1 like blog bs 1 blog
Like_Blog.belongsTo(Blog, {as : "blog"})//foreignKey : "idBlog" }

//1 category bs ada di banyak blog
Category.hasMany(Blog)
//1 blog bs 1 category
Blog.belongsTo(Category, {as : "category"})//,{foreignKey : "idCategory" }


export { User, Category, Blog, Like_Blog}