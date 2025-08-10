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
  updateDoc,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuthUser } from "@/utils/auth";
import {
  CreateTaskData,
  ApiResponse,
  Task,
  UpdateTaskData,
  AuthUser,
} from "@/types";
import { omitBy, isNil } from "lodash";
import dayjs from "dayjs";

const DEFAULT_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const user = getAuthUser(request) as AuthUser;

    if (user.role !== "admin") {
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
      assignedToUser: {
        id: assignedTo,
        name: userDoc.data().name,
        phoneNumber: userDoc.data().phoneNumber,
      },
      assignedBy: user.id,
      assignedByUser: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      },
      dueDate: dayjs(dueDate).format("YYYY-MM-DD"),
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
    const user = getAuthUser(request) as AuthUser;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");

    const tasksRef = collection(db, "tasks");
    let q;

    const cursorDoc = cursor ? await getDoc(doc(db, "tasks", cursor)) : null;
    const commonQueryParams = [
      orderBy("status", "desc"),
      orderBy("dueDate", "asc"),
      ...(cursor ? [startAfter(cursorDoc)] : []),
      limit(DEFAULT_LIMIT),
    ];

    // If user is member, only show their tasks
    if (user.role === "member") {
      q = query(
        tasksRef,
        where("assignedTo", "==", user.id),
        ...commonQueryParams
      );
    } else {
      // If admin, show all tasks
      q = query(tasksRef, ...commonQueryParams);
    }

    const querySnapshot = await getDocs(q);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
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

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request) as AuthUser;

    const body: UpdateTaskData = await request.json();
    const { id, status, title, description, dueDate, assignedTo } = body;

    if (user.id !== assignedTo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Không có quyền truy cập",
        },
        { status: 403 }
      );
    }

    const patchData = omitBy(
      {
        status,
        title,
        description,
        dueDate,
      },
      isNil
    );

    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, patchData);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Cập nhật công việc thành công",
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}
