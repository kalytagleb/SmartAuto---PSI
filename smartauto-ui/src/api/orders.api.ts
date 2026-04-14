import { apiClient } from './index';
import { Order } from '../types';

export const ordersApi = {
    getAll: () =>
        apiClient.get<Order[]>('/orders'),

    create: (data: { customerId: string; carId: string; description: string; location: string }) =>
        apiClient.post<Order>('/orders', data),

    assignStaff: (id: string, data: { managerId?: string; mechanicId?: string; driverId?: string }) =>
        apiClient.patch<Order>(`/orders/${id}/assign`, data),

    addPart: (id: string, data: { partId: string; quantity: number }) =>
        apiClient.patch<Order>(`/orders/${id}/add-part`, data),

    complete: (id: string, signatureData: string) =>
        apiClient.patch<Order>(`/orders/${id}/complete`, { signatureData }),

    finishRepair: (id: string) =>
        apiClient.patch<Order>(`/orders/${id}/finish-repair`),
};
