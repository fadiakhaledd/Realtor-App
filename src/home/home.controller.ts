import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dtos/create-home.dto';
import { HomeResponseDto } from './dtos/home-response.dto';
import { PropertyType } from '@prisma/client';
import { UpdateHomeDto } from './dtos/update-home-dto';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) { }

    @Get()
    getHomes(
        @Query('city') city?: String,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType,
    ): Promise<HomeResponseDto[]> {

        const price = (minPrice || maxPrice) ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
        } : undefined

        const filters = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        }
        return this.homeService.getAllHomes(filters)
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) homeId: number) {
        return this.homeService.getHome(homeId)
    }

    @Post()
    createHome(@Body() body: CreateHomeDto) {
        return this.homeService.addHome(body)
    }

    @Put(':id')
    updateHome(
        @Param('id', ParseIntPipe) homeId: number,
        @Body() updateHomeDto: UpdateHomeDto) {
        return this.homeService.updateHome(homeId, updateHomeDto)
    }

    @Delete(':id')
    deleteHome(@Param('id', ParseIntPipe) homeId: number) {
        return this.homeService.deleteHome(homeId)
    }

}
