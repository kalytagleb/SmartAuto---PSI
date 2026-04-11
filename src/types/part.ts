export interface Part {
    id: string;
    name: string;
    stockQuantity: number;
    price: number;
}

// Part inside of order (intermediary entity)
export interface OrderPart {
    part: Part;
    quantity: number;
    unitPrice: number;
}