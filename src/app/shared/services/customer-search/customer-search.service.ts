import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {environment} from '../../../../environments/environment';
import {CustomerObject} from '../../../models/customer-object';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';


@Injectable()
export class CustomerSearchService {
  private rootUrl = environment.rootApiUrl + '/ech/';

  private selectedCustomerSource = new BehaviorSubject<CustomerObject>(null);
  currentSelectedCustomer = this.selectedCustomerSource.asObservable();

  public orderCustomerChanged = new BehaviorSubject(false);

  constructor(
    private storeInfoService: StoreinfoService,
    private http: HttpClient
  ) {
  }

  /**
   * Service all to search for customer. Takes CustomerSearch model
   * @param model
   */
  retreiveCustomerList(model): Observable<any> {
    return this.http.post(this.rootUrl + 'lookup?storeId=' + this.storeInfoService.getStoreNumber().toString() + '&country=' +
      this.storeInfoService.getStoreDetails().country.shortName, model)
      .timeoutWith(10000, Observable.throw(new Error('Error searching for customer, call timed out.')));
  }

  // we should type this
  changeSelectedCustomer(customer: any) {
    this.selectedCustomerSource.next(customer);
  }

}
