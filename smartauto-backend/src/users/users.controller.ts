import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from 'generated/prisma/enums';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() data: {email: string, fullName: string, role: UserRole, passwordRaw: string}) {
        return this.usersService.createUser(data);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }
}