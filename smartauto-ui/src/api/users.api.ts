import { apiClient } from './index';
import { User, UserRole } from '../types';

export const usersApi = {
    getAll: () =>
        apiClient.get<User[]>('/users'),

    getAvailable: (role: UserRole, start?: string, end?: string) => {
        const params: Record<string, string> = {};
        if (start) params.start = start;
        if (end) params.end = end;
        return apiClient.get<User[]>(`/users/available/${role}`, { params });
    },

    create: (data: { email: string; fullName: string; role: UserRole; passwordRaw: string }) =>
        apiClient.post<User>('/users', data),
};
