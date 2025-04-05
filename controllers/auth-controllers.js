import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toLocaleString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
        verificationToken,
        phone,
      },
    });
    console.log(user);
    if (user) {
      return res.status(200).json({
        success: true,
        message: "Registration successfull",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
      message: "Registration faild",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const users = await prisma.user.findUnique({
      where: { email },
    });

    if (!users) {
      return res.status(400).json({
        success: false,
        message: "User not register",
      });
    }

    const isMatch = await bcrypt.compare(password, users.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const jwtToken = jwt.sign(
      {
        id: users.id,
        role: users.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const cookieOptions = {
      httpOnly: true,
    };
    res.cookie("token", jwtToken, cookieOptions);

    res.status(201).json({
      success: true,
      jwtToken,
      user: {
        name: users.name,
        id: users.id,
        email: users.email,
      },
      message: "You are loggedIn",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error,
      message: "LoggedIn faild",
    });
  }
};

export { registerUser, loginUser };
