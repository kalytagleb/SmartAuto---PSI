import { Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService, private config: ConfigService, private prisma: PrismaService) {}

    async getTokens(userId: string, email: string, role: string) {
        const payload = {
            sub: userId,
            email,
            role
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt
        };
    }

    async login(email: string, pass: string, response: Response) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
            throw new UnauthorizedException('Invalid data');
        }

        const tokens = await this.getTokens(user.id, user.email, user.role);

        await this.updateRefreshToken(user.id, tokens.refresh_token);

        this.setCookies(response, tokens);

        return {
            user: {
                id: user.id,
                role: user.role,
                fullName: user.fullName
            }
        };
    }

    private setCookies(res: Response, tokens: {access_token: string, refresh_token: string}) {
        const commonOptions = {
            httpOnly: true,
            secure: false,
        };

        res.cookie('access_token', tokens.access_token, {...commonOptions, maxAge: 15 * 60 * 1000});
        res.cookie('refresh_token', tokens.refresh_token, {...commonOptions, maxAge: 7 * 24 * 60 * 60 * 1000});
    }

    async updateRefreshToken(userId: string, rt: string) {
        const hash = await bcrypt.hash(rt, 10);
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshTokenHash: hash
            }
        });
    }

    async refreshTokens(refreshToken: string, response: Response) {
        const decoded = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
        });

        const user = await this.usersService.findOneById(decoded.sub);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Access Denied!');
        }
        
        const rtMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

        if (!rtMatches) throw new UnauthorizedException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        this.setCookies(response, tokens);

        return {
            message: 'Tokens refreshed'
        };
    }

    async validateUserByToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
            });

            const user = await this.usersService.findOneById(payload.sub);
            if (!user) return null;

            return {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            };
        } catch (e) {
            return null;
        }
    }
}