export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    MANAGER = 'MANAGER',
    MECHANIC = 'MECHANIC',
    DRIVER = 'DRIVER',
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isAvailbale: boolean;
}