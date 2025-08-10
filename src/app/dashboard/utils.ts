import { Task, TaskState } from "@/types";
import dayjs from "dayjs";

export const getTaskState = (task: Task): TaskState => {
  const now = dayjs();
  const dueDate = dayjs(task.dueDate);

  if (task.status === "completed") return "completed";
  if (dueDate.isBefore(now)) return "overdue";
  if (dueDate.isAfter(now) && dueDate.isBefore(now.add(3, "day"))) {
    return "dueSoon";
  }
  return "pending";
};
