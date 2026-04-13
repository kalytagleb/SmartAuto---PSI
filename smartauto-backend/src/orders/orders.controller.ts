import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { time } from 'console';

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

    @Patch(':id/add-part')
    addPart(
        @Param('id') id: string,
        @Body() data: {partId: string, quantity: number}
    ) {
        return this.ordersService.addPartToOrder(id, data.partId, data.quantity);
    }

    @Patch(':id/complete')
    complete(
        @Param('id') id: string,
        @Body() data: {signatureData: string}
    ) {
        return this.ordersService.completeOrder(id, data.signatureData);
    }

    @Patch(':id/finish-repair')
    finish(@Param('id') id: string) {
        return this.ordersService.finishRepair(id);
    }

    @Get()
    findAll() {
        return this.ordersService.findAll();
    }
}