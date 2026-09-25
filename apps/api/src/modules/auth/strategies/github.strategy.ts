import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID', 'placeholder'),
      clientSecret: config.get('GITHUB_CLIENT_SECRET', 'placeholder'),
      callbackURL: config.get('GITHUB_CALLBACK_URL', 'http://localhost:4000/api/auth/github/callback'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const user = {
      githubId: profile.id,
      email: profile.emails?.[0]?.value,
      firstName: profile.displayName?.split(' ')[0] || profile.username,
      lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
