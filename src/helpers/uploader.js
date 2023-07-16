import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import * as config from "../config/index.js";

// @configure storage
export const createDiskStorage = (directory) => multer.diskStorage({
    
    destination: (req, file, cb) => {
        cb(null, directory)
    },
    filename: (req, file, cb) => {
        // @if image type is valid
        cb(null, "IMG" + "-" + Date.now() + path.extname(file.originalname))
        // IMG-198031830918309183.jpg
    }
})

// @configure cloudinary storage
cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
})
export const createCloudinaryStorage = (directory, id=1) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: directory,
        public_id: (req, file) => {
            const type = directory.split("/")[1]
            if(type === "Blogs"){
            return 'IMG-' + Date.now()
            }
            if(type === "Profiles")
            return `IMG-${req?.user?.id}`
        },
        allowedFormats: ['jpeg', 'png', 'jpg'],
        invalidate : true
    }
})

// @configure upload
export const createUploader = (storage) => multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // @1MB
    use_filename: true, 
    unique_filename: false
    // fileFilter: (req, file, cb) => {
    //     // @check file type
    //     const fileTypes = /jpg|jpeg|png|gif/;
    //     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

    //     // @if image type is not valid
    //     if (!extname) {
    //         return cb(new Error("Error: Images Only!"), false)
    //     }

    //     // @if image type is valid
    //     cb(null, true)
    // }
})

export const deleteImage= async(publicId) => {
    try {
        cloudinary.uploader.destroy(publicId, function () {
            console.log("Image deleted");
        });
    } catch (error) {
        next(error);
    }
}