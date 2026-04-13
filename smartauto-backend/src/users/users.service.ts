import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';
import { PrismaClient } from 'generated/prisma/internal/class';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(data: {email: string, fullName: string, role: UserRole, passwordRaw: string}) {
        const salt = await bcrypt.genSalt();
        const hashedPath = await bcrypt.hash(data.passwordRaw, salt);
        
        return this.prisma.user.create({
            data: {
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                passwordHash: hashedPath,
            },
        });
    }

    async findAvailable(role: UserRole, start?: string, end?: string) {
        const where: any = {
            role: role,
            isAvailable: true,
        };

        if (start && end) {
            const slotStart = new Date(start);
            const slotEnd = new Date(end);

            where.NOT = {
                OR: [
                    {
                        mechanicOrders: {
                            some: {
                                AND: [
                                    {
                                        plannedStart: {
                                            lt: slotEnd
                                        }
                                    },
                                    {
                                        plannedEnd: {
                                            gt: slotStart
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        driverOrders: {
                            some: {
                                AND: [
                                    {
                                        plannedStart: {
                                            lt: slotEnd
                                        }
                                    },
                                    {
                                        plannedEnd: {
                                            gt: slotStart
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            };
        }

        return this.prisma.user.findMany({where});
    }

    async findAll() {
        return this.prisma.user.findMany();
    }
}