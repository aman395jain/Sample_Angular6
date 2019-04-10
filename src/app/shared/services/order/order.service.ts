import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';
import {FileUploadService} from '../../../core/Services/FileUpload/FileUpload.service';
import {environment} from '../../../../environments/environment';
import {OrderSubmission} from '../../../models/OrderSubmission/OrderSubmission';


@Injectable()
export class OrderService {

  private rootUrl = environment.rootApiUrl + '/orders/';

  constructor(
    private storeInfoService: StoreinfoService,
    private fileUploadService: FileUploadService,
    private http: HttpClient
  ) {
  }

  retrieveCustomerOrderSummary(orderNumber: number) {
    return this.http.get(this.rootUrl + orderNumber + '/summary?locale=' + this.storeInfoService.getLanguageValue() +
      '&storeId=' + this.storeInfoService.getStoreId())
      .timeoutWith(10000, Observable.throw(new Error('Error retrieving order details, request timed out')));
  }

  submitOrder(order, saveForLater: boolean) {
    return this.http.post<any>(this.rootUrl + '?saveForLater=' + saveForLater, order, {observe: 'response'})
      .timeoutWith(600000, Observable.throw(new Error('Error submitting order, request timed out')));
  }

  submitToFlightDeck(orderNumber: string) {
    let local = 'Y';
    if (this.fileUploadService.useCloudPB() == 'true') {
      local = 'N';
    }
    return this.http.post<any>(this.rootUrl + 'submitToFlightDeck?orderNumber=' +
      orderNumber +'&localToStore='+local, this.storeInfoService.getStoreId(), {observe: 'response'})
      .timeoutWith(600000, Observable.throw(new Error('Error sending to flight deck, request timed out')));
  }

  submitToWorkFront(workFrontRequest : OrderSubmission) {
    return this.http.post<any>(this.rootUrl + 'submitToWorkFront', workFrontRequest, {observe: 'response'})
      .timeoutWith(600000, Observable.throw(new Error('Error creating WorkFront project, request timed out')));
  }

  reorder(orderNumber: number) {
    return this.http.get(this.rootUrl + orderNumber + '/reorder?storeId=' + this.storeInfoService.getStoreId()
      + '&locale=' + this.storeInfoService.getLanguageValue())
      .timeoutWith(30000, Observable.throw(new Error('Error retrieving reorder details, request timed out')));
  }


  printOrder(orderNumber: number) {
    const storeId = this.storeInfoService.getStoreId();
    return this.http.get(this.rootUrl + orderNumber + '/print?orderno=' + orderNumber + '&storeid=' + storeId
      + '&locale=' + this.storeInfoService.getLanguageValue() + '&country=' + this.storeInfoService.getCountry())
      .timeoutWith(200000, Observable.throw(new Error('Error retrieving print order details, request timed out')));
  }

  getAddtoCartCoupon() {
    const url = environment.rootApiUrl + '/coupon/addToCart?storeId=' + this.storeInfoService.getStoreId();
    return this.http.get(url)
      .timeoutWith(200000, Observable.throw(new Error('Error retrieving coupons for AddToCart, request timed out')));
  }

}
