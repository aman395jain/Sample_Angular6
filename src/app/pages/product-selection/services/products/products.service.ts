import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../../core/Services/auth/auth.service';
import {StoreinfoService} from '../../../../core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '../../../../core/Services/logger-service/logger-service.service';

@Injectable()
export class ProductsService {

    private rootUrl = environment.rootApiUrl + '/products/';

    constructor(
            private storeInfoService: StoreinfoService,
            private http: HttpClient,
            private LOG: LoggerService,
            private auth: AuthService
    ) {   }

    retrieveStoreProducts() {

        // refreshes token as products render
        setTimeout(() => {
            this.auth.refreshToken().subscribe( result => {
                this.LOG.debug(new Date() + ' done refreshing');
            });
        }, 200);

        return this.http.get(this.rootUrl + '?locale=' + this.storeInfoService.getLanguageValue() +
        '&storeId=' + this.storeInfoService.getStoreNumber())
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving order details, request timed out')));
    }

    getPreConfProductQuantities(template) {
        return this.http.get(this.rootUrl + template + '/preConfProdOrderQty')
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving pre configured product quantity information, request timed out')));
    }

    getConfigProduct(code: string) {
        return this.http.get<any>(this.rootUrl + 'preconfiguredproducts/' + code + '/configProduct' + '?storeId=' +
            this.storeInfoService.getStoreNumber() + '&locale=' + this.storeInfoService.getLanguageValue())
            .timeoutWith(10000, Observable.throw(new Error('Error retrieving config product information, request timed out')));
   }

   getSDSConfigProduct(code: string) {
    return this.http.get<any>(this.rootUrl + code + '/configProduct' + '?storeId=' +
        this.storeInfoService.getStoreNumber() + '&locale=' + this.storeInfoService.getLanguageValue())
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving config product information, request timed out')));
    }

}
