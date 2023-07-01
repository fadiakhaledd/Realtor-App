import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home-response.dto';
import { PropertyType } from '@prisma/client';
import { UpdateHomeDto } from './dtos/update-home-dto';

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}
@Injectable()
export class HomeService {

  constructor(private readonly prismaService: PrismaService) { }

  async getAllHomes(filters: any): Promise<HomeResponseDto[]> {
    try {
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
        },
        where: {
          ...filters
        }
      }
      ))

      if (!homes.length) throw new NotFoundException();

      return homes.map((home) => {
        const fetchHome = { ...home, image: home.images[0].url }
        delete fetchHome.images
        return new HomeResponseDto(fetchHome)
      })
    } catch (error) {
      throw error
    }
  };


  async getHome(homeId: number) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: { id: homeId },
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
          },
          realtor: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          }
        }
      })
      if (!home) throw new NotFoundException();
      return new HomeResponseDto(home);
    } catch (error) {
      throw error
    }
  }

  async addHome({
    address,
    numberOfBedrooms,
    numberOfBathrooms,
    city,
    price,
    landSize,
    propertyType,
    images }: CreateHomeParams) {
    try {

      const newHome = await this.prismaService.home.create({
        data: {
          address,
          number_of_bedrooms: numberOfBedrooms,
          number_of_bathrooms: numberOfBathrooms,
          city,
          price,
          land_size: landSize,
          propertyType,
          realtor_id: 1
        }
      })

      const homeImages = images.map(image => { return { ...image, home_id: newHome.id } })
      await this.prismaService.image.createMany({
        data: homeImages
      })

      return new HomeResponseDto(newHome)
    } catch (err) {
      throw err
    }
  }

  async updateHome(homeId: number, updateHomeParams: UpdateHomeParams) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: { id: homeId }
      })

      if (!home) throw new NotFoundException();
      const number_of_bedrooms = (updateHomeParams.numberOfBedrooms) ?
        updateHomeParams.numberOfBedrooms
        : undefined

      if (number_of_bedrooms) delete updateHomeParams.numberOfBedrooms;

      const number_of_bathrooms = (updateHomeParams.numberOfBathrooms) ?
        updateHomeParams.numberOfBathrooms
        : undefined

      if (number_of_bathrooms) delete updateHomeParams.numberOfBathrooms;

      const land_size = (updateHomeParams.landSize) ? updateHomeParams.landSize : undefined

      if (land_size) delete updateHomeParams.landSize;

      const updatedHome = await this.prismaService.home.update({
        where: { id: homeId },
        data: {
          ...updateHomeParams,
          ...(number_of_bathrooms && { number_of_bathrooms }),
          ...(number_of_bedrooms && { number_of_bedrooms }),
          ...(land_size && { land_size }),
          updated_at: new Date()
        }
      })

      return new HomeResponseDto(updatedHome);

    } catch (error) {
      throw error
    }
  }

  async deleteHome(homeId: number) {
    try {
      const home = await this.prismaService.home.findUnique({
        where: { id: homeId }
      })

      if (!home) throw new NotFoundException();

      await this.prismaService.image.deleteMany({
        where: { home_id: homeId }
      })

      await this.prismaService.home.delete({
        where: { id: homeId }
      })

    } catch (error) {
      throw error;
    }
  }

}
