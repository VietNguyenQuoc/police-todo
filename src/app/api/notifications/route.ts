import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendTaskReminder } from "@/utils/twilio";
import { ApiResponse, Task } from "@/types";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled function
    // For now, we'll allow it to be called manually for testing

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get tasks due in 3 days
    const tasksRef = collection(db, "tasks");
    const q = query(
      tasksRef,
      where("status", "==", "pending"),
      where("dueDate", "<=", threeDaysFromNow),
      where("dueDate", ">", now)
    );

    const querySnapshot = await getDocs(q);
    const remindersSent: string[] = [];
    const failedReminders: string[] = [];

    for (const taskDoc of querySnapshot.docs) {
      const taskData = taskDoc.data() as Task;

      // Get assigned user details
      const userRef = doc(db, "users", taskData.assignedTo);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const dueDate = dayjs(taskData.dueDate);

        const success = await sendTaskReminder(
          userData.phoneNumber,
          taskData.title,
          dueDate.toDate()
        );

        if (success) {
          remindersSent.push(taskDoc.id);
        } else {
          failedReminders.push(taskDoc.id);
        }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        remindersSent: remindersSent.length,
        failedReminders: failedReminders.length,
        details: {
          sent: remindersSent,
          failed: failedReminders,
        },
      },
      message: `Sent ${remindersSent.length} reminders, ${failedReminders.length} failed`,
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Lỗi hệ thống",
      },
      { status: 500 }
    );
  }
}
