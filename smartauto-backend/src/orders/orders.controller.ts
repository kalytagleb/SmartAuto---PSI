import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    create(@Body() data: {customerId: string, carId: string, description: string, location: string}) {
        return this.ordersService.createOrder(data);
    }

    @Patch(':id/assign')
    assign(
        @Param('id') id: string,
        @Body() data: {managerId?: string, mechanicId?: string, driverId?: string}
    ) {
        return this.ordersService.assignStaff(id, data);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }
}