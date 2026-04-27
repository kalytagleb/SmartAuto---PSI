import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Roles(UserRole.CUSTOMER, UserRole.MANAGER)
    @Post()
    create(@Body() data: {carId: string, description: string, location: string}, @Req() req: Request) {
        return this.ordersService.createOrder({...data, customerId: req['user'].sub});
    }

    @Roles(UserRole.MANAGER)
    @Patch(':id/assign')
    assign(
        @Param('id') id: string,
        @Body() data: {managerId?: string, mechanicId?: string, driverId?: string}
    ) {
        return this.ordersService.assignStaff(id, data);
    }

    @Roles(UserRole.MECHANIC, UserRole.MANAGER)
    @Patch(':id/add-part')
    addPart(
        @Param('id') id: string,
        @Body() data: {partId: string, quantity: number}
    ) {
        return this.ordersService.addPartToOrder(id, data.partId, data.quantity);
    }

    @Roles(UserRole.MANAGER)
    @Patch(':id/complete')
    complete(
        @Param('id') id: string,
        @Body() data: {signatureData: string}
    ) {
        return this.ordersService.completeOrder(id, data.signatureData);
    }

    @Roles(UserRole.MECHANIC)
    @Patch(':id/finish-repair')
    finish(@Param('id') id: string) {
        return this.ordersService.finishRepair(id);
    }

    @Roles(UserRole.MANAGER, UserRole.MECHANIC, UserRole.DRIVER)
    @Get()
    findAll() {
        return this.ordersService.findAll();
    }
}