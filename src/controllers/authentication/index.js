import { ValidationError } from "yup"
import * as config from "../../config/index.js"
import handlebars from "handlebars"
import transporter from "../../helpers/transporter.js"
import {User} from "../../models/relation.js"
import { Sequelize, Op } from "sequelize"
import db from "../../models/index.js"
import { hashPassword, comparePassword } from "../../helpers/encryption.js"
import { createToken, verifyToken } from "../../helpers/token.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middleware/error.handler.js"
import { LoginValidationSchema, RegisterValidationSchema, IsEmail, EmailValidationSchema, PasswordValidationSchema, ChangePassValidationSchema, ChangeUsernameValidationSchema, ChangePhoneValidationSchema, ChangeEmailValidationSchema, ForgotPassValidationSchema } from "./validation.js"
import { request } from "express"
import fs from "fs"
import path from "path"


const cache = new Map();


export const showAllUsers = async(req,res,next) =>{
    try{
        const users= await User?.findAll();
        res.status(200).json({users})
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//cara transactionnya masih belum mulus, seandainya kiirim verification
// @register process
export const register = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction(async()=>{      
        // @create transaction

        // @validation
        const { username, password, email, phone } = req.body;
        await RegisterValidationSchema.validate(req.body);

        // @check if user already exists
        const userExists = await User?.findOne({ where: { [Op.or]: [{username},{email}] } });
        if (userExists) throw ({ status : 400, message : USER_ALREADY_EXISTS });

        // @create user -> encypt password
        const hashedPassword = hashPassword(password);
        const user = await User?.create({
            username,
            password : hashedPassword,
            tempEmail : email,
            phone
        });

        // @delete password from response
        delete user?.dataValues?.password;

        // @generate access token
        const accessToken = createToken({ id: user?.dataValues?.id, role : user?.dataValues?.role });

        // @return response
        res
            .header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
            message: "User created successfully. Check email for verification",
            user
        });
        
        //@send email
        let receiver = user?.dataValues.username
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "verifyEmail.html"), "utf8");
        const html = handlebars.compile(template)({ name: (receiver.charAt(0).toUpperCase() + receiver.slice(1)), link :(config.REDIRECT_URL + `/verification/${accessToken}`) })
        const mailOptions = {
            from: `Mini-Project Team Support <${config.GMAIL}>`,
            to: email,
            subject: "Verification, nothing sus. Trust me.",
            html: html}
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log("Email sent: " + info.response);
            })
        });  


    } catch (error) {

        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @login process
export const login = async (req, res, next) => {
    try {
        // @validation, we assume that username will hold either username or email
        const { username, password } = req.body;
        await LoginValidationSchema.validate(req.body);

        // @check if username is email
        const isAnEmail = await IsEmail({email : username});
        console.log(isAnEmail)
        const query = isAnEmail ? { email : username } : {username };

        // @check if user exists
        const userExists = await User?.findOne({ where: query });
        if (!userExists) throw ({ status : 400, message : USER_DOES_NOT_EXISTS })

        
        // @check if password is correct
        const isPasswordCorrect = comparePassword(password, userExists?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : INVALID_CREDENTIALS });
        
        // @delete password from response
        delete userExists?.dataValues?.password;
        
        
        // @check token in chache
       const cachedToken = cache.get(userExists?.dataValues?.id)
       const isValid = cachedToken && verifyToken(cachedToken)
       let accessToken = null
       //@check if token exist and valid
       if (cachedToken && isValid) {
           accessToken = cachedToken
       } else {
           // @generate access token
           accessToken = createToken({ id: userExists?.dataValues?.id, role : userExists?.dataValues?.role });
           cache.set(userExists?.dataValues?.id, accessToken)
           // @check user verification status, because old token missing/ not valid
           if (userExists?.dataValues?.isVerified === false){
               //@send email again
               let receiver = userExists?.dataValues.username
               const template = fs.readFileSync(path.join(process.cwd(), "templates", "verifyEmail.html"), "utf8");
               const html = handlebars.compile(template)({ name: (receiver.charAt(0).toUpperCase() + receiver.slice(1)), link :(config.REDIRECT_URL + `/verification/${accessToken}`) })
               const mailOptions = {
                   from: `Mini-Project Team Support <${config.GMAIL}>`,
                   to: userExists?.dataValues?.tempEmail,
                    subject: "Verification, nothing sus. Trust me.",
                    html: html}
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) throw error;
                        console.log("Email sent: " + info.response);
                    })
   
           throw ({ status : 400, message : USER_DOES_NOT_EXISTS, 
               note : "We have resent new verification link to email" });
       }
    }        
          
            // @return response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ user : userExists })
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @verify account
export const verify = async (req, res, next) => {
    try {
        //@get tempEmail
        const UserExist = await User.findOne({where : {id : req?.user?.id}});
        // @update user status
        await User?.update({ isVerified: true , email : UserExist.tempEmail, tempEmail: null}, { where : { id : req?.user?.id } });

        // @return response
        res.status(200).json({ message : "Account verified successfully" })
    } catch (error) {
        next(error)
    }
}

//keeplogin
export const keepLogin = async (req,res,next) => {
    try{

        //@find the user's data
        const userResult = await User?.findOne( { where : { id : req?.user?.id } });

        //send data via response
        res.status(200).json({userResult})


    } catch (error) {
        next(error)
    }

}

//forgotpassword (get email, send verif to reset password)
export const forgotPass = async ( req,res,next) => {
    try{
        const transaction = await db.sequelize.transaction(async()=>{     
        // @ email validation
        const  {email}  = req.body;

        //@input validation
        await ForgotPassValidationSchema.validate(email); 

        //@ get id from email
        // @first, find the user's data
        const userResult = await User?.findOne( { where : {email: email } });

         // @generate access token
         const accessToken = createToken({ id: userResult?.id, role : userResult?.role }); 

         
         let receiver = userResult?.dataValues?.username
        //@send verification email
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "forgotPass.html"), "utf8");
        const html = handlebars.compile(template)({ name: (receiver.charAt(0).toUpperCase() + receiver.slice(1)), link :(config.REDIRECT_URL + `/reset-password/${accessToken}`) })
        
        const mailOptions = {
            from: `Mini-Project Team Support <${config.GMAIL}>`,
            to: email,
            subject: "Forgot Password",
            html: html}
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log("Email sent: " + info.response);
            })
            // @return response
           res
               .status(200)
               .json({
               message: "We have sent verification email for reset password",
           });
        });

    } catch (error){
        next(error)
    }
}

//reset password
export const reset = async(req,res,next) =>{
    try{
        //@grab password from res; validate and encrypt it into hashedpassword
        const {password} = req.body;

        //@password template validation
        await PasswordValidationSchema.validate(password);
        const hashedPassword = hashPassword(password);

        //@update user data
        await User?.update({ password: hashedPassword}, {
            where: {
                id : req?.user?.id
            }
          });
        
        // @ send rexponse message only, cause they need to relogin
        res
        .status(200)
        .json({
        message: "Success! Your new password is ready to use. Go back to login page",
    });
    } catch(error){
        next(error)
    }
}

//change password
export const changePass = async(req,res,next) =>{
    try{
        
        //@find user based on the received token
        const userExists= await User?.findOne( { where : { id : req?.user?.id } });
        
        //@grab currentPassword and password from res
        const {currentPassword, password} = req.body;

        //@validation of passwords
        await ChangePassValidationSchema.validate({currentPassword,password});
        
        //@check currentPassword if it's correct
        const isPasswordCorrect = comparePassword(currentPassword, userExists?.dataValues?.password);
        if (!isPasswordCorrect) throw ({ status : 400, message : INVALID_CREDENTIALS });

        //@encrypt new password
        const hashedPassword = hashPassword(password);

        //@update data
        await User?.update({ password: hashedPassword}, {
            where: {
                id : req?.user?.id
            }
          });

        // @ send rexponse message only, cause they need to relogin
        res
        .status(200)
        .json({
        message: "Success! You have changed your password. Go back to login page",
    });
    } catch(error){
        next(error)
    }
}


//change data (username/ phone)
//change username
export const changeUsername = async(req,res,next) =>{
    try{
        
        //@grab new username from res
        const {newUsername} = req.body;

        //@validation of usernames
        await ChangeUsernameValidationSchema.validate(req.body);
        
        //@update data
        await User?.update({ username : newUsername}, {
            where: {
                id : req?.user?.id
            }
          });

        // @ send rexponse message only, based on postman api
        res
        .status(200)
        .json({
        message: "Success! You have changed your username!"
    });
    } catch(error){
        next(error)
    }
}

//change phone
export const changePhone = async(req,res,next) =>{
    try{
        //@grab new phone from res
        const {newPhone} = req.body;

        //@validation of phones
        await ChangePhoneValidationSchema.validate(req.body);
        
        //@update data
        await User?.update({ phone : newPhone}, {
            where: {
                id : req?.user?.id
            }
          });

        // @ send rexponse message only, based on postman api
        res
        .status(200)
        .json({
        message: "Success! You have changed your phone!"
    });
    } catch(error){
        next(error)
    }
}

//change email
//--ada kirim token di postman? harus kirim verif change email buat ganti data
//seharusnya pas klik linknya baru otomatis keganti, jadi harus simpan old email dulu? 
//kalau dy klik ignore, filenya masih yang lama

//takut gak jalan
export const changeEmail = async ( req,res,next) => {
    try{
        const transaction = await db.sequelize.transaction(async()=>{     
        const  {newEmail}  = req.body;
        // @ email validation
        await ChangeEmailValidationSchema.validate(req.body); 
        
        //@get user data
        const userResult = await User?.findOne({where : {id : req?.user?.id}})

        // @update user
        await User?.update({ status : 0, tempEmail : newEmail}, {
            where: {
                id : req?.user?.id
            }
          });
          console.log(req?.user?.id)
          console.log(userResult)

          //@send verification email
          let receiver = userResult?.dataValues?.username
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "verifyChangeEmail.html"), "utf8");
        const html = handlebars.compile(template)({ name: (receiver.charAt(0).toUpperCase() + receiver.slice(1)), link :(config.REDIRECT_URL + `/verification-change-email/${req?.token}`) })
        console.log(html)
        const mailOptions = {
            from: `Mini-Project Team Support <${config.GMAIL}>`,
            to: newEmail,
            subject: "Verify New Email",
            html: html}
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log("Email sent: " + info.response);
            })
            // @return response
            res
            .status(200)
            .json({
                message: "We have sent verification email for email change",
              });
        });
        
    } catch (error){
        next(error)
    }
}
