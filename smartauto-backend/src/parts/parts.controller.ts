import { Body, Controller, Post } from '@nestjs/common';
import { PartsService } from './parts.service';

@Controller('parts')
export class PartsController {
    constructor(private readonly partsService: PartsService) {}
    
    @Post()
    create(@Body() data: {name: string, stockQuantity: number, price: number}) {
        return this.partsService.createPart(data);
    }
}