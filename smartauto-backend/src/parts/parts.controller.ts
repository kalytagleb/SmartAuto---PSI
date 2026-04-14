import { Body, Controller, Get, Post } from '@nestjs/common';
import { PartsService } from './parts.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('parts')
export class PartsController {
    constructor(private readonly partsService: PartsService) {}

    @Roles(UserRole.MANAGER)
    @Post()
    create(@Body() data: {name: string, stockQuantity: number, price: number}) {
        return this.partsService.createPart(data);
    }

    @Roles(UserRole.MANAGER, UserRole.MECHANIC)
    @Get()
    findAll() {
        return this.partsService.findAll();
    }
}