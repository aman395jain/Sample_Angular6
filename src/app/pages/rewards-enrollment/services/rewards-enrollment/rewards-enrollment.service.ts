import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient } from '@angular/common/http';
import {enrollmentStatus} from '@app/models/enrollmentStatus';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {rewardsCustomer} from '@app/models/rewardsCustomer';
import {environment} from '@env/environment';


@Injectable()
export class RewardsEnrollmentService {

  rootUrl = environment.rootApiUrl + '/rewards/';
  private enrollURL = 'rewardsProgram/';

  constructor(
    private httpClient: HttpClient,
    private storeInfoService: StoreinfoService
  ) {
  }

  /* Service to enroll a customer in the rewards program
  * Takes rewardsCustomer model
  * @param model
  */
  callRewardsEnrollAPI(model: rewardsCustomer) {
    const options = {
      headers: new HttpHeaders({
      'Content-Type': 'application/json'
      })
    };

    // add store number to model
    model.storeNumber = this.storeInfoService.getStoreNumber().toString();

    return this.httpClient.post(this.rootUrl + this.enrollURL, model, options)
        .map(this.extractData)
        .catch(this.handleError)
        .timeoutWith(10000, Observable.throw(new Error('Error searching for customer, call timed out')));
  }

  // extracts body from response
  // returns enrollmentStatus model
  extractData(res) {
    const body: enrollmentStatus = res;
    return body;
  }

  // extracts error from response
  handleError(error: Response | any) {
    return Observable.throw(error.message || error);
  }

}
