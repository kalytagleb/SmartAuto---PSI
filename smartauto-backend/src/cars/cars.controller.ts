import { Body, Controller, Post } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('cars')
export class CarsController {
    constructor(private readonly carsService: CarsService) {}

    @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
    @Post()
    create(@Body() data: {licensePlate: string, brand: string, model: string, ownerId: string}) {
        return this.carsService.createCar(data);
    }
}