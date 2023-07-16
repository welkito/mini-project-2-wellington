import { ValidationError } from "yup"
import {Blog,Category,Like_Blog} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middleware/error.handler.js"
import { validationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"


//done
export const showAllBlogs = async(req,res,next) =>{
    try{
        const {id_cat, page, sort } = req.query;
        //queries depends
        const limit = 10;
        const opt = {
            offset: page - 1 > 0 ? parseInt(page - 1) * parseInt(limit) : 0,
            limit: limit, 
            order:[ ["dateCreated", sort]]
        }
        const blog = await Blog?.findAll({
            where: {
                categoryId : id_cat? id_cat : {[Op.between] : [1,7]},
            },
          ...opt
        });
                // @get total blog, according to the blog query
                const total = await Blog?.count({
                    where: {
                        categoryId : id_cat? id_cat : {[Op.between] : [1,7]},
                    },
                });

                // @get total pages
                const pages = Math.ceil(total / opt.limit);

        //pagination
        res.status(200).json({
            message : "All Blogs data",
            currentPage : page,
            totalPage : pages,
            result : blog
        })
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const showLikedBlogs = async(req,res,next) =>{ 
    try{
        const {page} = req?.query;
        const query = await Like_Blog?.findAll({
            attributes : ["blogId"],
            where : {userId : req.user.id}
        })
        const limit = 10;
        const opt = {
            offset: page - 1 > 0 ? parseInt(page - 1) * parseInt(limit) : 0,
            limit: limit,
        }
        const allLikedBlogs = await Blog?.findAll({
             where: {
                id : {
                     [Op.in] :  [
                        Sequelize.literal(`(
                            SELECT blogId
                            FROM like_blogs AS like_blog
                            WHERE
                                like_blog.userId = ${req.user.id}
                            
                        )`)
                    ]
                    } 
                },
                ...opt
            });
            console.log(JSON.parse(JSON.stringify(allLikedBlogs)).length)

        // @get total tickets
        const total = JSON.parse(JSON.stringify(query)).length;

        // @get total pages
        const pages = Math.ceil(total / opt.limit);
        //pagination part
        res.status(200).json({
            message : "succeed",
            currentPage : page,
            totalPage : pages,
            result : allLikedBlogs
        })
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const showCategory= async(req,res,next) =>{
    try{
        const category= await Category?.findAll();
        res.status(200).json({category})
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const createBlog= async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //@extract JSON formdata and parse it
        const { data } = req.body;
        const newBlog = JSON.parse(data);
        
        //validation
        await validationSchema.validate(newBlog);

        //create into db
        const result = await Blog?.create({
            title : newBlog.title,
            content : newBlog.content,
            country : newBlog.country,
            thumbnail : req?.file?.path,
            url : newBlog.url,
            keywords : newBlog.keywords,
            categoryId : newBlog.CategoryId,
            userId : req?.user?.id
        });

        //send result
        res.status(200).json({message: "Success", result: result})

    });
    }
    catch(error){
                
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const deleteBlog= async(req,res,next) =>{
    try{
        const { id } = req.params;
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        // @extract JSON formdata and parse it
        const currentBlog = await Blog?.findOne({where : { id: id}});

        //code for gettin public_id
        const deString = currentBlog.thumbnail.split("Public")[1]
        const image  = "Public"+deString.split(".")[0]
        //delete image blog on cloudinary
        await deleteImage(image)

        //delete blog data on sql server
        await Blog?.destroy({
            where: {
              id: id
            }
          });

        res.status(200).json({message : "Delete blog succeed"})
        });
     
    }
    catch(error){


        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const showMostFavoriteBlogs= async(req,res,next) =>{
    try{
        const FavBlogs = await db.sequelize.query(`
            SELECT blog.id, blog.title, category.name as cat, blog.userId,
            blog.content,
            blog.dateCreated, COUNT(like_blog.blogId) as total_like
            FROM blogs AS blog
            JOIN like_blogs AS like_blog ON blog.id = like_blog.blogId
            JOIN categories AS category ON blog.categoryId = category.id
            GROUP BY blog.id
            ORDER BY total_like DESC LIMIT 10;
        `,{
            type: QueryTypes.SELECT
        })
        res.status(200).json(FavBlogs)
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//done
export const likeBlog= async(req,res,next) =>{
    try{
        //verify token, and get blogId from req
        const {BlogId } = req.body;
        //query add table liked_blog, with id blog from req, id user from req.user
        const likeExist= await Like_Blog?.findOne({ where: { blogId: BlogId , userId : req.user.id} });
        if(likeExist){
            return res.status(200).json({message : "already liked"})
        }
        else{
            await Like_Blog?.create(
            {
                blogId : BlogId,
                userId : req.user.id
            }
        )}
        res.status(200).json({message : "like blog succeed"})

    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

