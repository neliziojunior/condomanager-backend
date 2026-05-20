import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { email: string; name: string; password: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  // ✅ NOVO: Login com Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Redireciona para o Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req) {
    // Retorna o token JWT
    const token = req.user.access_token;
    return `
      <html>
        <script>
          window.opener.postMessage({ token: '${token}' }, '*');
          window.close();
        </script>
      </html>
    `;
  }
}
