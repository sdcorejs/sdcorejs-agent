import { Global, Module } from '@nestjs/common';
import { AuthenticationGuard, DenyAllTokenVerifier, TOKEN_VERIFIER } from './authentication';
import { PolicyGuard } from './policy';

@Global()
@Module({
  providers: [
    AuthenticationGuard,
    PolicyGuard,
    { provide: TOKEN_VERIFIER, useClass: DenyAllTokenVerifier },
  ],
  exports: [AuthenticationGuard, PolicyGuard, TOKEN_VERIFIER],
})
export class AuthModule {}
