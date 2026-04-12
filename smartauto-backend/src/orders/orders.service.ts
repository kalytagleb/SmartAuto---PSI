import { Injectable } from '@nestjs/common';
import { OrderStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) {}

    // UC01: Create Order
    async createOrder(data: {customerId: string, carId: string, description: string}) {
        return this.prisma.order.create({
            data: {
                customerId: data.customerId,
                carId: data.carId,
                description: data.description,
                status: OrderStatus.NEW,
            },
            include: {
                car: true,
                customer: true
            }
        });
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {car: true, customer: true}
        });
    }
}