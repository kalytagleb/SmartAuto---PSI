export const UserRole = {
    CUSTOMER:'CUSTOMER',
    MANAGER: 'MANAGER',
    MECHANIC: 'MECHANIC',
    DRIVER: 'DRIVER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isAvailable: boolean;
}