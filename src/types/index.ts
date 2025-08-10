export type Role = "admin" | "member";
export type TaskStatus = "pending" | "completed";

export interface User {
  id: string;
  phoneNumber: string;
  password: string;
  name: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // Admin User ID
  dueDate: string;
  status: TaskStatus;
  assignedToUser: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  assignedByUser: {
    id: string;
    name: string;
    phoneNumber: string;
  };
}

export type CreateTaskData = Omit<
  Task,
  "id" | "status" | "assignedToUser" | "assignedByUser"
>;

export type UpdateTaskData = Pick<Task, "id"> &
  Partial<Omit<Task, "id" | "assignedToUser" | "assignedByUser">>;

export interface CreateUserData {
  name: string;
  phoneNumber: string;
  password: string;
  role: Role;
}

export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  role: Role;
  name: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  token?: string;
  data?: T;
  message?: string;
}

export interface CreateUserResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export type TaskState = TaskStatus | "overdue" | "dueSoon";
