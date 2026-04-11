import type { Car } from "./car";
import type { OrderPart } from "./part";
import type { User } from "./user";

export enum OrderStatus {
    NEW = 'NEW',
    ASSIGNED = 'ASSIGNED',
    IN_REPAIR = 'IN_REPAIR',
    WAITING_FOR_PARTS = 'WAITING_FOR_PARTS',
    REPAIRED = 'REPAIRED',
    DELIVERING = 'DELIVERING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

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
    parts: OrderPart[],

    location?: string;
    estimatedPrice?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Protocol {
    id: string;
    orderId: string;
    signatureDate: string;
    signedAt: string;
}