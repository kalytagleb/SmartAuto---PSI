import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from 'generated/prisma/enums';
import { User } from 'generated/prisma/browser';
import { start } from 'repl';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() data: {email: string, fullName: string, role: UserRole, passwordRaw: string}) {
        return this.usersService.createUser(data);
    }

    @Get('available/:role')
    findAvailable(@Param('role') role: UserRole, @Query('start') start?: string, @Query('end') end?: string) {
        return this.usersService.findAvailable(
            role,
            start,
            end
        );
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }
}