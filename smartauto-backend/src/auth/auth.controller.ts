import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private usersService: UsersService) {}

    @Public()
    @Post('login')
    async login(@Body() data: {email: string, pass: string}, @Res({passthrough: true}) res: Response) {
        return this.authService.login(data.email, data.pass, res);
    }

    @Public()
    @Post('refresh')
    async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException('No refresh token');

        return this.authService.refreshTokens(refreshToken, res);
    }

    @Public()
    @Post('logout')
    async logout(@Res({passthrough: true}) res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return {
            message: 'Logged out'
        };
    }

    @Public()
    @Post('register')
    async register(@Body() data: {email: string, fullName: string, passwordRaw: string}, @Res({passthrough: true}) res: Response) {
        await this.usersService.createUser({
            email: data.email,
            fullName: data.fullName,
            passwordRaw: data.passwordRaw,
            role: 'CUSTOMER',
        });

        return this.authService.login(data.email, data.passwordRaw, res);
    }

    @Get('whoami')
    async whoAmI(@Req() req: Request) {
        const token = req.cookies['access_token'];
        if (!token) throw new UnauthorizedException();

        return this.authService.validateUserByToken(token);
    }
}