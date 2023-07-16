import * as Yup from "yup"

export const validationSchema = Yup.object({
    title: Yup.string().required("Username is required"),
    content : Yup.string().required("Content is required"),
    country : Yup.string().required("Country is required"),
    CategoryId : Yup.string().required("Category is required"),
    url : Yup.string(),
    keywords : Yup.string().required("keywords is required"),
})

