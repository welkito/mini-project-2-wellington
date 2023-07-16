import { Router } from "express"
import { verifyUser } from "../../middleware/token.verify.js"
// @import the controller
import * as AuthControllers from "./index.js"

// @define routes
const router = Router()
//routes for authentication
router.get("/users",AuthControllers.showAllUsers)
router.post("/register", AuthControllers.register)
router.post("/login", AuthControllers.login)
router.get("/verify", verifyUser, AuthControllers.verify)//need
router.get("/",verifyUser, AuthControllers.keepLogin)//need
router.put("/forgotPass",AuthControllers.forgotPass)
router.patch("/resetPass", verifyUser, AuthControllers.reset)//need
router.patch("/changePass", verifyUser, AuthControllers.changePass)//need
router.patch("/changeUsername", verifyUser, AuthControllers.changeUsername)//need
router.patch("/changePhone", verifyUser, AuthControllers.changePhone)//need
router.patch("/changeEmail",verifyUser, AuthControllers.changeEmail)//need

export default router
