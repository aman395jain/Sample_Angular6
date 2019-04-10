import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import {AuthService} from '@app/core/Services/auth/auth.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService,
                private LOGGER: LoggerService,
                private sharedDataService: SharedDataService
                ) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe( retry(this.determineRetries(request.url)), 
        catchError(err => {

          if (err.status === 0 && request.url.includes('api/brokerping')) {
            this.sharedDataService.pbServerStatus = 'Local Unavailable';
            return throwError(null);
          } else {
            this.LOGGER.error(err);
          }

          if (err.status === 401) {
            // auto logout if 401 response returned from api
            this.authenticationService.logout();
            location.reload(true);
          }

          if (err.status === 400 || err.status === 500) {
            if ( request.url.includes('oauth/token')) {
              console.error('AUTH error: '+ JSON.stringify(err));
              this.authenticationService.authError.next(true);
              this.authenticationService.showLoader.next(false);
              this.authenticationService.loginSub.unsubscribe();
            }
          }

          if (err.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', err.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${err.status}, ` + `body was: ${JSON.stringify(err.error)}`);
          }

          // const error = err.error.message || err.statusText;
          if (err.error.message) {
            return throwError(err.error.message);
          } else {
            return throwError(err.error);
          }
        }));
    }

    determineRetries(requestUrl) {
      // Customize # of retries by request here
      if (requestUrl.endsWith('/oauth/token') || requestUrl.includes('submitToFlightDeck') || requestUrl.includes('submitToWorkFront')) {
        return 0;
      }
      return 1;
    }

    determineTimeout(requestUrl) {

      // default 30 secs
      if (requestUrl.includes('workfrontproxy')) {
        return 600000;
      } else {
        // default 30 secs
        return 30000;
      }
    }
}
