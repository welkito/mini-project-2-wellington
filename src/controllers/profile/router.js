import { Router } from "express"
import path from "path"
import { verifyUser } from "../../middleware/token.verify.js"
import { createUploader, createCloudinaryStorage } from "../../helpers/uploader.js"

// @setup multer
const id = 2;
// path.join(process.cwd(), "public", "images", "profiles")
const storage = createCloudinaryStorage("Public/Profiles")
const uploader = createUploader(storage)

// @import the controller
import * as ProfileControllers from "./index.js"

// @define routes
const router = Router()
router.patch("/single-uploaded",verifyUser, uploader.single("file"), ProfileControllers.uploadImage)
router.get("/", verifyUser, ProfileControllers.getProfile)

// @export router
export default router 