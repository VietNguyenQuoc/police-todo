import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyToken } from "@/utils/auth";
import { CreateUserData, ApiResponse, User, CreateUserResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Không có quyền truy cập",
        },
        { status: 401 }
      );
    }

    const [, token] = authHeader.split("Bearer ");
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Cần quyền quản trị viên",
        },
        { status: 403 }
      );
    }

    const body: CreateUserData = await request.json();
    const { name, phoneNumber, password } = body;

    if (!name || !phoneNumber || !password) {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phoneNumber", "==", phoneNumber));
    const existingUser = await getDocs(q);

    if (!existingUser.empty) {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Số điện thoại này đã được sử dụng",
        },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: Omit<User, "id"> = {
      name: name.trim(),
      phoneNumber,
      password,
      role: "member",
    };

    const docRef = await addDoc(usersRef, newUser);

    return NextResponse.json<CreateUserResponse>({
      success: true,
      data: {
        id: docRef.id,
        phoneNumber,
        role: "member",
      },
      message: "Tạo thành viên thành công",
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json<CreateUserResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Không có quyền truy cập",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json<CreateUserResponse>(
        {
          success: false,
          message: "Cần quyền quản trị viên",
        },
        { status: 403 }
      );
    }

    // Get all members
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "member"));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
      phoneNumber: doc.data().phoneNumber,
      role: doc.data().role,
    }));

    return NextResponse.json<CreateUserResponse<Omit<User, "password">[]>>({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json<CreateUserResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}
