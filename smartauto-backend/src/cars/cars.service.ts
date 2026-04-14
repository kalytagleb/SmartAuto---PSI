import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CarsService {
    constructor(private prisma: PrismaService) {}

    async createCar(data: {licensePlate: string, brand: string, model: string, ownerId: string}) {
        try {
            return await this.prisma.car.create({
                data: {
                    licensePlate: data.licensePlate,
                    brand: data.brand,
                    model: data.model,
                    ownerId: data.ownerId,
                },
            });
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('A car with this license plate already exists');
            }
            throw e;
        }
    }
}