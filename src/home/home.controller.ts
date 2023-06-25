import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dtos/create-home.dto';
import { HomeResponseDto } from './dtos/home-response.dto';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) { }

    @Get()
    getHomes(): Promise<HomeResponseDto[]> {
        return this.homeService.getAllHomes()
    }

    @Get(':id')
    getHome(@Param('id') homeId: number) {
        this.homeService.getHome(homeId)
    }

    @Post()
    createHome(@Body() body: CreateHomeDto) {
        this.homeService.addHome(body)
    }

    @Put(':id')
    updateHome(@Param('id') homeId: number) {
        this.homeService.updateHome(homeId)
    }

    @Delete(':id')
    deleteHome(@Param('id') homeId: number) {
        this.homeService.deleteHome(homeId)
    }

}
