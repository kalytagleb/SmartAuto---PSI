import axios from "axios";

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true, // For Cookies
});

export const authApi = {
    login: (email: string, pass: string) => 
        apiClient.post('/auth/login', {email, pass}),

    register: (userData: any) => 
        apiClient.post('/auth/register', userData),

    logout: () =>
        apiClient.post('/auth/logout'),

    refresh: () =>
        apiClient.post('/auth/refresh'),
};