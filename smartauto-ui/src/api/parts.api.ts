import { apiClient } from './index';
import { Part } from '../types';

export const partsApi = {
    getAll: () =>
        apiClient.get<Part[]>('/parts'),

    create: (data: { name: string; stockQuantity: number; price: number }) =>
        apiClient.post<Part>('/parts', data),
};
