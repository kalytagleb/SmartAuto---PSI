import { Body, Controller, Post, Req } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { Request } from 'express';

@Controller('cars')
export class CarsController {
    constructor(private readonly carsService: CarsService) {}

    @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
    @Post()
    create(@Body() data: {licensePlate: string, brand: string, model: string}, @Req() req: Request) {
        return this.carsService.createCar({...data, ownerId: req['user'].sub});
    }
}