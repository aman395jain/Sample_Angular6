import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {CustomerObject} from '../../../models/customer-object';
import {EchCustomerParam} from '../../../models/ech-customer-param';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '../../../core/Services/order-config/order-config.service';


@Injectable()
export class EchCustomerService {
  private rootUrl = environment.rootApiUrl + '/ech/customer';

  constructor(
    private http: HttpClient,
    private storeInfoService: StoreinfoService,
    private orderConfigService: OrderConfigService
  ) {
  }

  addCustomerToEch(newCustomer: CustomerObject) {
    const echCustParam = new EchCustomerParam();

    echCustParam.customer = newCustomer;
    echCustParam.country = this.storeInfoService.getCountry();
    echCustParam.optIn = this.orderConfigService.optIn;

    return this.http.post<CustomerObject>(this.rootUrl, echCustParam)
      .timeoutWith(900000, Observable.throw(new Error('Error adding customer to ECH.')));
  }

}
