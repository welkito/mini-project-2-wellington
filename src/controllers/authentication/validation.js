import * as Yup from "yup"

export const RegisterValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required").min(6,"password must at least 6 characters"), //min 6 characters
    email : Yup.string().email("Invalid email").required("Email is required"),
    phone : Yup.string().required("Phone is required")
})

export const LoginValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required")
    .min(6,"password must at least 6 characters") //min 6 characters
})

export const EmailValidationSchema = Yup.object({
    email : Yup.string().email("Invalid email").required("Email is required")
})

export const ForgotPassValidationSchema = Yup.string({
    email : Yup.string().email("Invalid email").required("Email is required")
})

export const PasswordValidationSchema = Yup.string({
    password : Yup.string().required("Password is required")
    .min(6,"password must at least 6 characters") //min 6 characters
})

export const ChangePassValidationSchema = Yup.object({
    currentPassword : Yup.string().required("Current password is required")
    .min(6,"current password must at least 6 characters"), //min 6 characters
    password : Yup.string().required("Password is required")
    .min(6,"new password must at least 6 characters")
})

export const ChangeUsernameValidationSchema = Yup.object({
    currentUsername : Yup.string().required("Current username is required"),
    newUsername : Yup.string().required("Username is required")
})

export const ChangePhoneValidationSchema = Yup.object({
    currentPhone : Yup.string().required("Current phone is required"),
    newPhone : Yup.string().required("Phone is required")
})

export const ChangeEmailValidationSchema = Yup.object({
    currentEmail : Yup.string().email("Invalid email").required("Email is required"),
    newEmail : Yup.string().email("Invalid email").required("Email is required")
})

export const IsEmail = async (email) => {
    return await EmailValidationSchema.isValid( email )
}

