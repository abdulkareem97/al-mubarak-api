import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const registerUser = async (email, password, name, role = "STAFF") => {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: { email, name, password: hashedPassword, role },
    });
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  } catch (error) {
    throw error;
  }
};

