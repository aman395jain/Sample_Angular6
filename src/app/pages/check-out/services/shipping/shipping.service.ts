import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject, Subscription, throwError } from 'rxjs';

@Injectable()
export class ShippingService {

    private rootUrl = environment.rootApiUrl + '/shipping/';

    constructor(
            private http: HttpClient
    ) {}

    submitShippingRequest(request) {
        return this.http.post<any>(this.rootUrl + 'rates', request, {observe: 'response'})
        .timeoutWith(600000, Observable.throw(new Error('Error submitting shipping request, request timed out')));
    }

}
