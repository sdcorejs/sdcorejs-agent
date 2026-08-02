import { Global, Module } from '@nestjs/common';
import { APP_ENV, loadEnv } from '../config/env';
import { AuthenticationGuard, OidcTokenVerifier, TOKEN_VERIFIER } from './authentication';
import { PolicyGuard } from './policy';

@Global()
@Module({
  providers: [
    AuthenticationGuard,
    PolicyGuard,
    { provide: APP_ENV, useFactory: () => loadEnv(process.env) },
    { provide: TOKEN_VERIFIER, useClass: OidcTokenVerifier },
  ],
  exports: [AuthenticationGuard, PolicyGuard, TOKEN_VERIFIER],
})
export class AuthModule {}
