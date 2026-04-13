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
    async createOrder(data: {customerId: string, carId: string, description: string, location: string, plannedStart?: string, plannedEnd?: string}) {
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
                plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
                plannedEnd: data.plannedEnd ? new Date(data.plannedEnd) : null,
            },
            include: {
                customer: true,
                car: true,
            },
        });
    }

    // UC02: AssignStaff
    async assignStaff(orderId: string, data: {managerId?: string, mechanicId?: string, driverId?: string, isTowing?: boolean}) {
        const updateOrder = await this.prisma.order.update({
            where: {id: orderId},
            data: {
                ...data,
                status: OrderStatus.ACCEPTED,
            },
            include: {
                mechanic: true,
                driver: true,
            }
        });

        if (updateOrder.mechanic) {
            console.log(`Notification to Mechanic ${updateOrder.mechanic.fullName}: You should do order #${orderId}`);
        }

        if (updateOrder.driver) {
            console.log(`Notification to Mechanic ${updateOrder.driver.fullName}: ${data.isTowing ? 'There is need evacuation!' : 'Usual delivery'} for order #${orderId}`);
        }

        return updateOrder;
    }

    // UC04: Add part to order and update warehouse
    async addPartToOrder(orderId: string, partId: string, quantity: number) {
        const part = await this.prisma.part.findUnique({where: {id: partId}});

        if (!part || part.stockQuantity < quantity) {
            // UC05: We don't have part on warehouse
            await this.prisma.order.update({
                where: {id: orderId},
                data: {status: OrderStatus.WAITING_FOR_PARTS}
            });
            throw new Error('There are no parts on warehouse! Order status changed.');
        }

        // I use here transaction, because transaction guarantee that all three actions execute successfully, or db return to initial state.
        return this.prisma.$transaction(async (tx) => {
            // Remove part from warehouse
            await tx.part.update({
                where: {id: partId},
                data: {stockQuantity: {decrement: quantity}}
            });

            // Add part to order (into intermediary table)
            const orderPart = await tx.orderPart.create({
                data: {
                    orderId: orderId,
                    partId: partId,
                    quantity: quantity,
                    unitPrice: part.price
                }
            });

            await tx.order.update({
                where: {id: orderId},
                data: {status: OrderStatus.IN_REPAIR}
            });

            return orderPart;
        });
    }

    // UC06: Finishing order and creating protocol
    async completeOrder(orderId: string, signature: string) {
        return this.prisma.$transaction(async (tx) => {
            const protocol = await tx.protocol.create({
                data: {
                    orderId: orderId,
                    signatureData: signature,
                }
            });

            const order = await tx.order.update({
                where: {id: orderId},
                data: {status: OrderStatus.COMPLETED},
                include: {protocol: true}
            });

            return order;
        });
    }

    // UC04: Finishing of repair
    async finishRepair(orderId: string) {
        return this.prisma.order.update({
            where: {id: orderId},
            data: {
                status: OrderStatus.REPAIRED
            }
        });
    }

    async findAll() {
        return this.prisma.order.findMany({
            include: {
                customer: true,
                car: true,
                mechanic: true,
                parts: {
                    include: {
                        part: true
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        });
    }
}