import { ConflictException, Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'
import { User } from 'generated/prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(data: {email: string, fullName: string, role: UserRole, passwordRaw: string}) {
        const salt = await bcrypt.genSalt();
        const hashedPath = await bcrypt.hash(data.passwordRaw, salt);
        
        try {
            return await this.prisma.user.create({
                data: {
                    email: data.email,
                    fullName: data.fullName,
                    role: data.role,
                    passwordHash: hashedPath,
                },
            });
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('User with this email already exists');
            }
            throw e;
        }
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

    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                id
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }
}