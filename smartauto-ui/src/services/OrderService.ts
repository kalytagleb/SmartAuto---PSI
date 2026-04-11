import { BehaviorSubject, catchError, finalize, Observable, of, shareReplay } from "rxjs";
import { Order, OrderStatus, User } from "../types";

class OrderService {
    // It saves our current list of orders.
    private orders$ = new BehaviorSubject<Order[]>([]);

    private loading$ = new BehaviorSubject<boolean>(false);
    public isLoading$ = this.loading$.asObservable();

    public allOrders$: Observable<Order[]> = this.orders$.asObservable().pipe(
        shareReplay(1)
    );

    public fetchOrders() {
        this.loading$.next(true);

        api.getOrders().pipe(
            tap(orders => this.orders$.next(orders)),

            catchError(err => {
                console.error('Error: ', err);
                return of([]);
            }),

            finalize(() => this.loading$.next(false))
        ).subscribe();
    }
}