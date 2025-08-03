import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};
