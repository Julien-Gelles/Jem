export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  type: "user" | "customer";
};

export type LoginRequest = {
  email: string;
  password: string;
  type: "user" | "customer" | "admin";
};

export type JwtUser = {
  id: string;
  email: string;
  type: "user" | "customer" | "admin";
};

export type UpdateRequest = {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  address?: string;
  zipcode?: string;
  city?: string;
  country?: string;
  firstname?: string;
  lastname?: string;
  phonenumber?: string;
};
