import { BehaviorSubject, map } from "rxjs";
import { User } from "../types";

class AuthService {
    // Main stream - Current user
    private user$ = new BehaviorSubject<User | null>(null);

    // Public Observable.
    // React components will subscribe to him.
    public currentUser$ = this.user$.asObservable();

    public userRole$ = this.currentUser$.pipe(
        map(user => user?.role)
    );

    // Method to record user into stream
    public setUser(user: User) {
        this.user$.next(user);
    }

    // For logout
    public clearUser() {
        this.user$.next(null);
    }
}

export const authService = new AuthService();