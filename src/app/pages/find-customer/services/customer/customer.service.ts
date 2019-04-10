import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {environment} from '../../../../../environments/environment';


@Injectable()
export class CustomerService {

  private rootUrl = environment.rootApiUrl + '/customer/';

  constructor(
    private http: HttpClient
  ) {
  }


  retrieveOrderHistoryByCustomerNumber(customerNumber: string, rewardsNumber: string) {
    if (rewardsNumber) {
      return this.http.get<any>(this.rootUrl + 'customernumber/' + customerNumber + '/orderhistory?rewardsNumber=' + rewardsNumber);
      // .timeoutWith(10000, Observable.throw(new Error('Error fetching order history, call timed out')));
    } else {
      return this.http.get<any>(this.rootUrl + 'customernumber/' + customerNumber + '/orderhistory');
      // .timeoutWith(10000, Observable.throw(new Error('Error fetching order history, call timed out')));
    }
  }

}
