import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
      private router: Router,
      private storeInfoService: StoreinfoService,
      private LOG: LoggerService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (sessionStorage.getItem('currentUser')) {
            // logged in so return true
            return true;
        }
        let returnURL = state.url;
        if (state.url.toLowerCase().includes('storeid')) {
          const pos = state.url.toLowerCase().indexOf('storeid=') + 8;
          let storeId = state.url.substring(pos);
          const andPos = storeId.indexOf('&');
          if ( andPos > 0) {
            storeId = storeId.substring(0, andPos);
          }
          this.LOG.info('Setting Store Number from URL: ' + storeId);
          this.storeInfoService.setStoreNumber(parseInt(storeId));
          returnURL = state.url.substring(0, state.url.indexOf('?'));
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: returnURL }});
        return false;
    }
}