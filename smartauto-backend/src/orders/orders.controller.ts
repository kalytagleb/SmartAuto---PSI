import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() data: {customerId: string, carId: string, description: string, location: string}) {
        return this.ordersService.createOrder(data);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }
}