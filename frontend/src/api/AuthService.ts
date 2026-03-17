import api from './api'
import type { LoginRequest, LoginResponse, RegisterRequest } from './types';

export async function register(data: RegisterRequest) {
    try {
        await api.post("/auth/register", data);

         const loginResponse = await login({
            username: data.username,
            password: data.password
        });

        return loginResponse;
    } catch (err: any) {
        throw err.response?.data || "Something went wrong";
    }
}


export async function login(data: LoginRequest) {
    try {
        const response = await api.post<LoginResponse>("/auth/login", data);
        if (response && response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            return response.data;
        }
        throw new Error("Invalid login response");

    } catch(err: any) {
        console.log(err)
        throw new Error(err.response?.data?.message || "Login failed");
    } finally {
        console.log("login called")
    }

}


export async function logout()
{
    // console.log("called")
    // localStorage.removeItem('auth_token');
    try {
        await api.post("/auth/logout");
    } finally {
        localStorage.removeItem('auth_token');
    }
    console.log("logout called")
}