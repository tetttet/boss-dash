export type Role = "student" | "teacher" | "admin";

export type Civility = "Mr" | "Ms" | "Mrs";


export interface User {
  id: string;
  civility?: Civility | null;
  firstname: string;
  lastname: string;
  email: string;
  mobilephone?: string | null;
  role: Role;
  birthday?: string | null; // ISO string (YYYY-MM-DD)
  created_at?: string;
  updated_at?: string;
}

/**
 * Используется для update профиля
 */
export interface UpdateUserPayload {
  civility?: Civility;
  firstname?: string;
  lastname?: string;
  email?: string;
  mobilephone?: string;
  birthday?: string;
  role?: Role;
}