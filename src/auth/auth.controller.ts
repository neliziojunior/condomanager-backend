import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { email: string; name: string; password: string; role?: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  // ✅ Login com Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redireciona para o Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const token = req.user.access_token;
    
    // Redirecionar de volta para o frontend com o token
    const frontendUrl = process.env.FRONTEND_URL || 'https://condopro-frontend.vercel.app';
    return res.redirect(`${frontendUrl}/login?token=${token}`);
  }
}
