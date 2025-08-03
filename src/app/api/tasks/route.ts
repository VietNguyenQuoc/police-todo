import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyToken } from "@/utils/auth";
import { CreateTaskData, ApiResponse, Task, TaskWithUser } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
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

    if (!user || user.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Cần quyền quản trị viên",
        },
        { status: 403 }
      );
    }

    const body: CreateTaskData = await request.json();
    const { title, description, assignedTo, dueDate } = body;

    if (!title || !description || !assignedTo || !dueDate) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin",
        },
        { status: 400 }
      );
    }

    // Verify assignedTo user exists
    const userRef = doc(db, "users", assignedTo);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Không tìm thấy thành viên được giao",
        },
        { status: 400 }
      );
    }

    // Create new task
    const newTask: Omit<Task, "id"> = {
      title,
      description,
      assignedTo,
      assignedBy: user.id,
      dueDate: new Date(dueDate),
      status: "pending",
    };

    const tasksRef = collection(db, "tasks");
    const docRef = await addDoc(tasksRef, newTask);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: docRef.id,
        ...newTask,
      },
      message: "Tạo công việc thành công",
    });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json<ApiResponse>(
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
          message: "Token không hợp lệ",
        },
        { status: 401 }
      );
    }

    const tasksRef = collection(db, "tasks");
    let q;

    // If user is member, only show their tasks
    if (user.role === "member") {
      q = query(
        tasksRef,
        where("assignedTo", "==", user.id),
        orderBy("dueDate", "asc")
      );
    } else {
      // If admin, show all tasks
      q = query(tasksRef, orderBy("dueDate", "asc"));
    }

    const querySnapshot = await getDocs(q);

    // Get user details for each task
    const tasksWithUsers: TaskWithUser[] = [];

    for (const taskDoc of querySnapshot.docs) {
      const taskData = taskDoc.data() as Omit<Task, "id">;

      // Get assigned user details
      const assignedUserRef = doc(db, "users", taskData.assignedTo);
      const assignedUserDoc = await getDoc(assignedUserRef);

      // Get assigned by user details
      const assignedByUserRef = doc(db, "users", taskData.assignedBy);
      const assignedByUserDoc = await getDoc(assignedByUserRef);

      tasksWithUsers.push({
        id: taskDoc.id,
        ...taskData,
        dueDate: taskData.dueDate,
        assignedToUser: {
          id: taskData.assignedTo,
          name: assignedUserDoc.exists()
            ? assignedUserDoc.data()?.name || "Unknown"
            : "Unknown",
          phoneNumber: assignedUserDoc.exists()
            ? assignedUserDoc.data()?.phoneNumber
            : "Unknown",
        },
        assignedByUser: {
          id: taskData.assignedBy,
          name: assignedByUserDoc.exists()
            ? assignedByUserDoc.data()?.name || "Unknown"
            : "Unknown",
          phoneNumber: assignedByUserDoc.exists()
            ? assignedByUserDoc.data()?.phoneNumber
            : "Unknown",
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: tasksWithUsers,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}
