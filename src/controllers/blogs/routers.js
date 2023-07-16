import {Router} from "express";
import { verifyUser } from "../../middleware/token.verify.js"
import { createUploader, createCloudinaryStorage } from "../../helpers/uploader.js"
// @import the controller
import * as BlogControllers from "./index.js"

const storage = createCloudinaryStorage("Public/Blogs")
const uploader = createUploader(storage)
// @define routes
const router = Router()
//routes for blogs
router.get("/allCategory",BlogControllers.showCategory)
router.delete("/remove/:id", verifyUser, BlogControllers.deleteBlog)//need
router.get("/pagLike",verifyUser, BlogControllers.showLikedBlogs)//need
router.post("/like",verifyUser, BlogControllers.likeBlog)//need
router.get("/pagFav",BlogControllers.showMostFavoriteBlogs)
router.post("", verifyUser, uploader.single("file"), BlogControllers.createBlog)//need 
router.get("", BlogControllers.showAllBlogs) 

export default router 