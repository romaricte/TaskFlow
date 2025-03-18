import { UserRole } from '@prisma/client';

export interface UserResponse {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
} 