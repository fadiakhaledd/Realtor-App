import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import * as jwt from "jsonwebtoken"
import { UserType } from '@prisma/client';
import { SignInDto } from '../dtos/auth.dto';


interface SignUpParams {
    name: string;
    email: string;
    password: string;
    phone: string;
}

interface SignInParams {
    email: string;
    password: string;
}

@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService) { }

    async signup({ email, password, name, phone }: SignUpParams) {
        const userExists = await this.prismaService.user.findUnique({
            where: { email: email }
        });

        if (userExists) {
            throw new ConflictException();
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.prismaService.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                user_type: UserType.BUYER
            }
        });

        return this.generateToken(user.id, name);
    }

    async signin({ email, password }: SignInParams) {
        const user = await this.prismaService.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return new HttpException("Invalid credentials", 400);
        }

        const hashedPassword = user.password
        const isValidPassword = await bcrypt.compare(password, hashedPassword);
        if (!isValidPassword) {
            return new HttpException("Invalid credentials", 400);
        }
        return this.generateToken(user.id, user.name);
    }

    private generateToken(id: number, name: string) {
        const token = jwt.sign({
            id,
            name,
        }, process.env.JWT_Key, {
            expiresIn: 3600000
        })
        return token
    }
}
