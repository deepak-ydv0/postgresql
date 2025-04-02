import express from "express";
import { registerControllers } from "../controllers/auth-controllers.js";

const userRouter = express.Router();

userRouter.post("/register", registerControllers);

export default userRouter;
