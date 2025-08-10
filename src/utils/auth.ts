import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ApiResponse, AuthUser } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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
      name: user.name,
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

export const getAuthUser = (
  request: NextRequest
): AuthUser | NextResponse<ApiResponse<AuthUser>> => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Không có quyền truy cập",
      },
      { status: 401 }
    );
  }
  const [, token] = authHeader.split("Bearer ");
  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Không có quyền truy cập",
      },
      { status: 401 }
    );
  }

  return user;
};
