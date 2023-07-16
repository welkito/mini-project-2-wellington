import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import requestLogger from "./src/middleware/logger.js"
import errorHandler from "./src/middleware/error.handler.js";
import path from "path";

// @config dotenv
dotenv.config();

// @create express app
const app = express();

// @use body-parser
app.use(bodyParser.json())
app.use(cors({ exposedHeaders : "Authorization" }))
app.use(requestLogger)

// @root route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to Mini-Project API! ;) by Wellington")
})

// @use router
import AuthRouters from "./src/controllers/authentication/routers.js"
import ProfileRouters from "./src/controllers/profile/router.js"
import BlogRouters from "./src/controllers/blogs/routers.js"
app.use("/api/auth", AuthRouters)
app.use("/api/profile", ProfileRouters)
app.use("/api/blog", BlogRouters)

// @global error handler
app.use(errorHandler)

// @listen to port
const PORT = process.env.PORT;
console.log(process.env.PORT)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));