import { Car } from "./car";
import { OrderPart } from "./part";
import { User } from "./user";

export const OrderStatus = {
    NEW: 'NEW',
    ACCEPTED: 'ACCEPTED',
    IN_REPAIR: 'IN_REPAIR',
    WAITING_FOR_PARTS: 'WAITING_FOR_PARTS',
    REPAIRED: 'REPAIRED',
    DELIVERING: 'DELIVERING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface Order {
    id: string;
    status: OrderStatus;
    description: string;

    // Aktors of order
    customer: User;
    manager?: User;
    mechanic?: User;
    driver?: User;

    car: Car;
    parts: OrderPart[];

    location?: string;
    estimatedPrice?: string;

    isTowing: boolean;
    plannedStart?: string;
    plannedEnd?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Protocol {
    id: string;
    orderId: string;
    signatureDate: string;
    signedAt: string;
}