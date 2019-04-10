import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {environment} from '../../../../environments/environment';
import {Address} from '../../../models/Address';
import {AddressResponse} from '../../../models/AddressResponse';


@Injectable()
export class AddressValidationService {

  rootUrl = environment.rootApiUrl + '/ech/';
  private currentAddress: Address;
  private errorMsgs: any;

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) {
    translate.get('COMMON.error.addressValidation').subscribe(
      data => {
        this.errorMsgs = data;
      }
    );
  }

  /*
   * @param Address
   * @returns AddressResponse
   */
  verifyAddress(address: Address): Observable<AddressResponse> {
    this.currentAddress = address;
    return this.http.post<any>(this.rootUrl + 'verifyAddress', address)
        .map(result => this.extractData(result))
        .catch(error => this.handleError(error))
        .timeoutWith(900000, Observable.throw(new Error('Error verifying address')));
  }

  private extractData(response): AddressResponse {
    const result = new AddressResponse();
    result.errorMsg = this.setErrorMessage(response);

    if (response.addressBeanResponse.verifiedAddress === 'skip') {
      result.addressVerified = true;
    } else if (response.addressBeanResponse.verifiedAddress === 'false') {
      result.addressVerified = false;
    } else {
      result.addressVerified = true;
    }

    if (result.addressVerified) {
      result.replaceAddress = this.checkAddressSuggestion(response);

      if (result.replaceAddress) {
        result.suggestedAddress = new Address(this.currentAddress.addressLine1, this.currentAddress.addressLine2,
                                  response.addressBeanResponse.AddrCity, this.currentAddress.country, response.addressBeanResponse.AddrProv,
                                  response.addressBeanResponse.ReplaceAddress);
      }
    }
    return result;
  }

  private setErrorMessage(response): string {
    if (response.addressBeanResponse.FaultCode === 'E412') {
      // bad address 1
      return this.errorMsgs.invalidAddress1;
    } else if (response.addressBeanResponse.FaultCode === 'E214') {
      // bad city and postal code
      return this.errorMsgs.invalidCityAndPostal;
    } else if (response.addressBeanResponse.FaultCode !== '') {
      // bad overall address
      return this.errorMsgs.invalidAddress;
    }
    return '';
  }

  private checkAddressSuggestion(response): boolean {
    if ( response.addressBeanResponse.AddrProv.toLowerCase() === this.currentAddress.state.toLowerCase()
          && response.addressBeanResponse.ReplaceAddress.includes(this.currentAddress.zip.substring(0, 5))
          && response.addressBeanResponse.AddrCity.toLowerCase() === (this.currentAddress.city.toLowerCase())) {
      // address suggestion contains no suggestion
      return false;
    }
    return true;
  }

  private handleError(error: any) {
    const response = new AddressResponse();
    response.addressVerified = false;
    response.errorMsg = this.errorMsgs.addressValidationFailure;
    return of(response);
  }

}
