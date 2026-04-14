import { apiClient } from './index';
import { Car } from '../types';

export const carsApi = {
    create: (data: { licensePlate: string; brand: string; model: string; ownerId: string }) =>
        apiClient.post<Car>('/cars', data),
};
