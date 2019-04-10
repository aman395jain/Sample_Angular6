import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {FormControl, Validators} from '@angular/forms';
import { OrderConfigService } from '../../../core/Services/order-config/order-config.service';

@Injectable()
export class ValidatorsService {

  constructor(
      private orderConfigService: OrderConfigService,
  ) {

  }
  // Add all of the FormControl Validators here as get functions

  getNameVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z\'\'_.-]{1,50}$')]);
  }

  getPhoneNumberVal() {
    return new FormControl('', [Validators.required, Validators.minLength(14), Validators.maxLength(14), Validators.pattern('\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}')]);
  }

  getEmailVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')]);
  }

  getAddressVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9\s,\'#-]*$')]);
  }

  getCityVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9\s,\'-]*$')]);
  }

  getZipCodeVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^\d{5}(?:[-\s]\d{4})?$')]);
  }

  getRewardsVal() {
    return new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]);
  }

  getRequiredVal() {
    return new FormControl('', [Validators.required]);
  }

  getMasterAccountVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^[1-9][0-9]{3,10}$')]);
  }

  getCompanyVal() {
      return new FormControl('', [Validators.required]);
  }

  getOrderNumberVal() {
    return new FormControl('', [Validators.required, Validators.pattern('[0-9]')]);
  }

  getAssociateNumberVal() {
    return new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]);
  }

  getStoreNumberVal() {
    return new FormControl('', [Validators.required, Validators.pattern('[0-9]*')]);
  }

  validatePositiveInteger( customInputProperty: string, errorMsgs, control: FormControl) {
    return new Promise((resolve, reject) => {
      const inputValue = control.value;
      const maxNumber = 2147483647;
      if (inputValue === '') {
          resolve({ 'error': true, 'msg': errorMsgs.notEmpty});
      } else if (isNaN(inputValue) || inputValue < 1 || inputValue.indexOf('.') !== -1 || parseInt(inputValue, 10) > maxNumber) {
          resolve({ 'error': true, 'msg': inputValue + ' ' + errorMsgs.notValidNumber});
      } else if (customInputProperty === 'GetTabQty' &&
          (parseInt(inputValue, 10) > this.orderConfigService.activeJob.impressions) &&
          this.orderConfigService.template.productId !== 'T1967507' ) {
          resolve({ 'error': true, 'msg': errorMsgs.cannotExceedMaxImpressions});
      } else {
          resolve(null);
      }
    });
  }

  validateDecimal(errorMsgs, control: FormControl) {
    return new Promise((resolve, reject) => {
      const inputValue = control.value;
      const maxNumber = 2147483647;
      if (inputValue === '') {
          resolve({ 'error': true, 'msg': errorMsgs.notEmpty});
      } else if (isNaN(inputValue) || inputValue <= 0 || parseInt(inputValue, 10) > maxNumber) {
          resolve({ 'error': true, 'msg': inputValue + ' ' + errorMsgs.notValidNumber});
      } else {
          resolve(null);
      }
    });
  }

  validatePositiveIntegerAndZero(errorMsgs, control: FormControl) {
    return new Promise((resolve, reject) => {
        const inputValue = control.value + 0;
        const maxNumber = 2147483647;
        if (inputValue.trim() === '') {
            resolve({ 'error': true, 'msg': errorMsgs.notEmpty});
        } else if (isNaN(inputValue) || inputValue < 0 || inputValue > maxNumber) {
            resolve({ 'error': true, 'msg': inputValue + ' ' + errorMsgs.notValidNumber});
        }  else {
          resolve(null);
        }
    });
  }

  validateAlphaNumeric(errorMsgs, control: FormControl) {
    return new Promise((resolve, reject) => {
      const maxString = 500;
      const inputValue = control.value;
        if (inputValue.trim() === '') {
            resolve({ 'error': true, 'msg': errorMsgs.notEmpty});
        } else if (inputValue.length > maxString) {
            resolve({ 'error': true, 'msg': errorMsgs.maxLengthExceeded});
        } else {
            resolve(null);
        }
    });
  }

  validateStockSheetSize(customKey: String, errorMsgs, control: FormControl) {
    return new Promise((resolve, reject) => {
      const inputValue = control.value;
      const maxNumber = 2147483647;
      if (inputValue.trim() === '') {
        resolve({ 'error': true, 'msg': errorMsgs.notEmpty});
      } else if (isNaN(inputValue) || inputValue <= 0 || parseInt(inputValue, 10) > maxNumber) {
        resolve({ 'error': true, 'msg': inputValue + ' ' + errorMsgs.notValidNumber});
      }
      let maxSize = this.orderConfigService.getSelectedStockSheetSize().replace(/\s+/g, '');
      let maxWidth = parseFloat(maxSize.split('x').pop());
      let maxHeight = parseFloat(maxSize.split('x', 1));
      if ( this.orderConfigService.getOptionByVCode('V5')) {
        maxHeight = maxHeight - 0.25 ;
        maxWidth = maxWidth - 0.25;
        maxSize = maxWidth + ' x ' + maxHeight;
      }

      if (maxSize !== undefined && maxSize !== '' && customKey === 'GetWidth') {
        if ( parseFloat(inputValue) <= maxWidth ) {
          resolve (null);
        } else {
          resolve({ 'error': true, 'msg':  errorMsgs.maxSizeForMedia  + ' ' + maxSize});
        }

      } else if (maxSize !== undefined && maxSize !== '' && customKey === 'GetHeight') {
        if ( parseFloat(inputValue) <= maxHeight) {
          resolve (null);
        } else {
          resolve({ 'error': true, 'msg':  errorMsgs.maxSizeForMedia + ' ' + maxSize});
        }
      } else {
        resolve({ 'error': true, 'msg': errorMsgs.maxSizeForMedia + ' ' + maxSize});
      }

    });
  }

  getReqCurrencyVal() {
    return new FormControl('', [Validators.required, Validators.pattern('^\d+(\.\d{4})?$')]);
  }
}
