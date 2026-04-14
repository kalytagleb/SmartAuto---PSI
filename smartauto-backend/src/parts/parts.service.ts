import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PartsService {
    constructor(private prisma: PrismaService) {}

    async createPart(data: {name: string, stockQuantity: number, price: number}) {
        return this.prisma.part.create({
            data: {
                name: data.name,
                stockQuantity: data.stockQuantity,
                price: data.price,
            },
        });
    }

    async findAll() {
        return this.prisma.part.findMany();
    }
}