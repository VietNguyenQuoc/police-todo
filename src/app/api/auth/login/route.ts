import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LoginData, ApiResponse, User } from "@/types";
import { generateToken } from "@/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { phoneNumber, password } = body;

    if (!phoneNumber || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Vui lòng nhập số điện thoại và mật khẩu",
        },
        { status: 400 }
      );
    }

    // Query user by phone number
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phoneNumber", "==", phoneNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No user found");
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Số điện thoại hoặc mật khẩu không đúng",
        },
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = {
      ...userDoc.data(),
      id: userDoc.id,
    } as User;

    // Verify password
    const isValidPassword = password === userData.password;
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Số điện thoại hoặc mật khẩu không đúng",
        },
        { status: 401 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      token: generateToken(userData),
      data: {
        user: {
          id: userDoc.id,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          name: userData.name || "Unknown",
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}
