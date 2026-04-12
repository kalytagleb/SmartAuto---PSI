import { Body, Controller, Post } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
    constructor(private readonly carsService: CarsService) {}
    
    @Post()
    create(@Body() data: {licensePlate: string, brand: string, model: string, ownerId: string}) {
        return this.carsService.createCar(data);
    }
}