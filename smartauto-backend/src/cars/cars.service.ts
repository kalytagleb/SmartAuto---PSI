import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CarsService {
    constructor(private prisma: PrismaService) {}

    async createCar(data: {licensePlate: string, brand: string, model: string, ownerId: string}) {
        return this.prisma.car.create({
            data: {
                licensePlate: data.licensePlate,
                brand: data.brand,
                model: data.model,
                ownerId: data.ownerId,
            },
        });
    }
}