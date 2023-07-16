import { User} from "../../models/relation.js";
import db from "../../models/index.js"

// @upload image
export const uploadImage = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction(async()=>{      
        // @check if image is uploaded
        if (!req.file) {
            throw new ({ status: 400, message: "Please upload an image." })
        }

        // @update the user profile
        await User?.update({ imgProfile : req?.file?.path}, { where : { id : req?.user?.id } })

        // @send response
        res.status(200).json({ message : "Image uploaded successfully.", id : req?.user?.id, imageUrl : req.file?.path })
    });
    } catch (error) {
        next(error)
    }
}

// @get user profile
export const getProfile = async (req, res, next) => {
    try {
        // @get the user profile
        const profile = await User?.findOne({ where : { id : req.user.id } })

        // @send response
        res.status(200).json({ profile })
    } catch (error) {
        next(error)
    }
}

