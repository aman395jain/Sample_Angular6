import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private storeInfoService: StoreinfoService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
              // add authorization header with jwt token if available
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.access_token && !request.url.includes('oauth/token')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.access_token}`,
                    storeId: this.storeInfoService.getStoreNumber().toString(),
                    userId: sessionStorage.getItem('currentUserUserName').replace(new RegExp('"', 'g'), '')
                }
            });
        }

        return next.handle(request);
    }
}
