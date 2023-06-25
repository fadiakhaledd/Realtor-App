import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeDto } from './dtos/create-home.dto';
import { HomeResponseDto } from './dtos/home-response.dto';

@Injectable()
export class HomeService {

  constructor(private readonly prismaService: PrismaService) { }

  async getAllHomes(): Promise<HomeResponseDto[]> {
    const homes = (await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        listed_date: true,
        land_size: true,
        images: {
          select: {
            url: true,
          }
        }
      }
    }
    ))

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url }
      delete fetchHome.images
      return new HomeResponseDto(fetchHome)
    })
  };


  getHome(homeId: number) {
    throw new Error('Method not implemented.');
  }

  addHome(body: CreateHomeDto) {
    throw new Error('Method not implemented.');
  }

  updateHome(homeId: number) {
    throw new Error('Method not implemented.');
  }

  deleteHome(homeId: number) {
    throw new Error('Method not implemented.');
  }

}
