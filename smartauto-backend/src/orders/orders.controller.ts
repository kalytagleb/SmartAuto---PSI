import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() createOrderDto: {customerId: string, carId: string, description: string}) {
        return this.ordersService.createOrder(createOrderDto);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }
}