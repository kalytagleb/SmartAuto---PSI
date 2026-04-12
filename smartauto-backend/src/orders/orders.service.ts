import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) {}

    private async getDistance(location: string): Promise<number> {
        return Math.floor(Math.random() * 50) + 5;
    }

    // UC01: Create Order
    async createOrder(data: {customerId: string, carId: string, description: string, location: string}) {
        const car = await this.prisma.car.findUnique({where: {id: data.carId}});
        const spzRegex = /^[A-Z]{2}-?\d{3}[A-Z]{2}$/;

        if (car && !spzRegex.test(car.licensePlate)) {
            throw new BadRequestException('Error. Invalid SPZ');
        }

        const distance = await this.getDistance(data.location);
        const calculatedPrice = (distance * 2) + 30;
        
        return this.prisma.order.create({
            data: {
                customerId: data.customerId,
                carId: data.carId,
                description: data.description,
                location: data.location,
                estimatedPrice: calculatedPrice,
                status: OrderStatus.NEW,
            },
            include: {
                customer: true,
                car: true,
            },
        });
    }

    // UC02: AssignStaff
    async assignStaff(orderId: string, data: {managerId?: string, mechanicId?: string, driverId?: string}) {
        return this.prisma.order.update({
            where: {id: orderId},
            data: {
                managerId: data.managerId,
                mechanicId: data.mechanicId,
                driverId: data.driverId,
                status: OrderStatus.ACCEPTED,
            },
            include: {
                mechanic: true,
                manager: true,
                car: true
            }
        });
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                customer: true,
                car: true,
                mechanic: true,
            },
            orderBy: {createdAt: 'desc'}
        });
    }
}