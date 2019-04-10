import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map, retry} from 'rxjs/operators';
import {TOKEN_AUTH_PASSWORD, TOKEN_AUTH_USERNAME} from './auth.constant';
import {BehaviorSubject, Subscription, throwError} from 'rxjs';
import {Idle} from '@ng-idle/core';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {environment} from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static AUTH_TOKEN = '/oauth/token';
  public loginSub: Subscription;
  public showLoader = new BehaviorSubject(false);
  public authError = new BehaviorSubject(null);
  public loggedIn = new BehaviorSubject(false);
  public dialogOpen = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private idle: Idle,
    private LOGGER: LoggerService
  ) { }


  login(username: string, password: string) {
    let params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');
  //  params.append('client_id', 'SolutionBuilderjwtclientid');

    return this.http.post<any>(environment.rootApiUrlAuth + '/oauth/token',  params.toString(), {headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(TOKEN_AUTH_USERNAME + ':' + TOKEN_AUTH_PASSWORD)
        }})
      .pipe( map(user => {
        this.LOGGER.debug(user);
        // login successful if there's a jwt token in the response
        if (user && user.access_token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes

          sessionStorage.setItem('currentUser', JSON.stringify(user));
          sessionStorage.setItem('currentUserUserName', JSON.stringify(user.principal));
        }

        return user;
      }), catchError(err => {
        this.LOGGER.error(err);
        const error = err.error.message || err.statusText;
        return throwError(error);
      }));
  }

  logout() {
    // Stop Idle timers
    this.loggedIn.next(false);

    // remove user from local storage to log user out
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUserUserName');

  }

  refreshToken() {
    const token = JSON.parse(sessionStorage.getItem('currentUser'));
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', token.refresh_token);
    //  params.append('client_id', 'SolutionBuilderjwtclientid');

    return this.http.post<any>(environment.rootApiUrlAuth + '/oauth/token',  params.toString(), {headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(TOKEN_AUTH_USERNAME + ':' + TOKEN_AUTH_PASSWORD)
        }})
      .pipe( map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.access_token) {
          user.refresh_token = token.refresh_token;
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
        return user;
      }), catchError(err => {
        this.LOGGER.error(err);
        if (err instanceof String) {
          return throwError(err);
        }
        const error = err.error.message || err.statusText;
        return throwError(error);
      }));
  }

  getRefreshRequestObject() {
    const token = JSON.parse(sessionStorage.getItem('currentUser'));
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', token.refresh_token);

    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    headers.set( 'Authorization', 'Basic ' + btoa(TOKEN_AUTH_USERNAME + ':' + TOKEN_AUTH_PASSWORD));

    return new HttpRequest('POST', environment.rootApiUrlAuth + '/oauth/token',  params.toString());
  }
}
