export interface User {
  id: string;
  phoneNumber: string;
  password: string;
  name: string;
  role: "admin" | "member";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // Admin User ID
  dueDate: Date;
  status: "pending" | "completed";
}

export interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}

export interface CreateUserData {
  name: string;
  phoneNumber: string;
  password: string;
  role: "member";
}

export interface LoginData {
  phoneNumber: string;
  password: string;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  role: "admin" | "member";
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

export interface TaskWithUser extends Task {
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
