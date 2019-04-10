import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {environment} from '../../../../environments/environment';
import {WesLeadComment} from '../../../models/wes-lead-comment';
import {CreateWesLeadAPI} from '../../../models/CreateWesLeadAPI';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';
import {WesLeadData} from '../../../models/wes-lead-data';

@Injectable()
export class WesleadsService {

    rootUrl = environment.rootApiUrl + '/sf/';

    constructor(
        private storeInfoService: StoreinfoService,
        private http: HttpClient
    ) {
    }

    /*
    * function to retrieve all Wes data for a store
    */
    retreiveWesData() {
    return this.http.get<any>(this.rootUrl + 'retrieveWesData/' + this.storeInfoService.getStoreNumber())
        .timeoutWith(10000, Observable.throw(new Error('Error retrieve Wes Data call timed out')));
    }

    /*
    * function to specific Wes lead entry
    * @param takes wes opportunity id
    */
    retrieveWesLead(opportunityId: string) {
        return this.http.get(this.rootUrl + 'weslead/' + opportunityId)
        .timeoutWith(10000, Observable.throw(new Error('Error retrieving Wes Lead, call timed out')));
    }

    /*
    *function to update comments to WESLEAD
    */

    updateWesLead(wesLead: WesLeadComment) {
        return this.http.post(this.rootUrl + 'weslead/' + wesLead.opportunityId, wesLead).
        timeoutWith(60000, Observable.throw(new Error('Error updating Wes Lead, call timed out')));
    }

    /*
    *function to create a WESLEAD
    */
    createWesLead(wesLead: WesLeadData) {
        const wesLeadApi = new CreateWesLeadAPI(wesLead.firstName, wesLead.lastName, null, wesLead.projectDetails,
        wesLead.preferredContact, wesLead.bestTimeToCall, wesLead.projectDueDate, wesLead.associateName,
        wesLead.company, String(wesLead.phoneNumber).replace(/[^0-9]/g, ''), wesLead.email,
        String(this.storeInfoService.getStoreNumber()), wesLead.rewardsNumber, !!wesLead.pricingIssue ? true : false);

        return this.http.post(this.rootUrl + 'weslead', wesLeadApi).
        timeoutWith(600000, Observable.throw(new Error('Error creating Wes Lead, call timed out')));
    }
}
