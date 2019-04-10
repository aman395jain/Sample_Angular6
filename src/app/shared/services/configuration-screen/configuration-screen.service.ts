import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {environment} from '../../../../environments/environment';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';

@Injectable()
export class ConfigurationScreenService {

    private rootUrl = environment.rootApiUrl + '/configurator/';
    private rootUrlOptions = environment.rootApiUrl + '/options/';
    private rootUrlUtils = environment.rootApiUrl + '/util/';

    constructor(
            private http: HttpClient,
            private storeInfoService: StoreinfoService
            ) {
    }

    retrieveGroupKeyOptions(templateId, configData) {
        return this.http.post(this.rootUrl + 'groupKeyOptions/' + templateId + '/' + this.storeInfoService.getLanguageValue()
        + '?storeId=' + this.storeInfoService.getStoreId(), configData )
        .timeoutWith(20000, Observable.throw(new Error('Error retrieving template details, request timed out')));
    }

    retrieveOptionDetails(options) {
        return this.http.post(this.rootUrl + 'optionDetails', options)
        .timeoutWith(20000, Observable.throw(new Error('Error retrieving template details, request timed out')));
    }

    retrieveOptionDetailsByTemplate(templateId) {
        return this.http.get(this.rootUrl + 'optionDetailsFromTemplate/' + templateId + '/' + this.storeInfoService.getLanguageValue() )
        .timeoutWith(20000, Observable.throw(new Error('Error retrieving template details, request timed out')));
    }

    retrieveAttributePropertiesByList(options) {
        return this.http.post(this.rootUrlOptions + 'properties', options)
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving template details, request timed out')));
    }

    getPricingandConditionalTicketing(pricingObject) {
        return this.http.post(this.rootUrl + 'conditionalPricing', pricingObject)
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving pricing and ticketing information, request timed out')));
    }

    validateExceptionPageRange(rangeToValidate, impressionCnt, existingRanges) {
        const params = new HttpParams().set('existingRanges', existingRanges);

        return this.http.get(this.rootUrlUtils + 'validatePageRange/' + rangeToValidate + '/' + impressionCnt, {params})
          .timeoutWith(10000, Observable.throw(new Error('Error validating page range')));
    }
}
