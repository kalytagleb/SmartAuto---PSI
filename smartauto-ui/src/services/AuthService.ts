import { BehaviorSubject, map } from "rxjs";
import { User } from "../types";
import { apiClient } from "../api";

class AuthService {
    private user$ = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.user$.asObservable();

    public userRole$ = this.currentUser$.pipe(
        map(user => user?.role)
    );

    public setUser(user: User) {
        this.user$.next(user);
    }

    public async logout() {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            this.user$.next(null);
        }
    }
}

export const authService = new AuthService();