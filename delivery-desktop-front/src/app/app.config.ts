
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AutoRefreshTokenService, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, includeBearerTokenInterceptor, provideKeycloak, UserActivityService, withAutoRefreshToken } from 'keycloak-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';



export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,  
      clientId: environment.keycloak.clientId,  
    },
    initOptions: {
      onLoad: 'login-required',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 6000000
      })
    ],
    providers: [AutoRefreshTokenService, UserActivityService]
  });


export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideExperimentalZonelessChangeDetection(),
    provideAnimations(), // required animations providers
    providePrimeNG(),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [
        {
          urlPattern: /^(http:\/\/localhost:8081)(\/.*)?$/i,
          httpMethods: ['GET', 'POST', 'DELETE', 'PUT']
        }
      ]
    },
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        })
  ],
};


