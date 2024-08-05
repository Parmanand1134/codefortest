import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('jwtSecret'),
  signOptions: { expiresIn: '1d' },
});
