import { PersistService } from '../persist/persist.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import { TranslateService } from '@ngx-translate/core';
import {environment} from '@env/environment';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {take} from 'rxjs/operators';

@Injectable()
export class StoreinfoService {

  rootUrl = environment.rootApiUrl + '/store/';

  // Store number
  private storeNumber;

  // default language from database;
  private defaultLanguage: String;

  // selected language
  private language: any = {};

  public storeDetails = {'storeId': 0, 'country': {'shortName': 'USA'}};

  // store available languages
  languages = [];

  private storeFeatures: any;

  public storeDetailsLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public persist: PersistService,
    public translate: TranslateService,
    private http: HttpClient
  ) {
  }


  /*
   * function to get the Store Number
   */
  getStoreNumber() {
    if (this.persist.containsKey('storeNumber')) {
      this.storeNumber = this.persist.get('storeNumber');
    }
    return this.storeNumber;
  }

  /*
   * function to set/change the store number
   */
  setStoreNumber(storeNumber: number) {
    this.storeNumber = storeNumber;
    this.persist.set('storeNumber', storeNumber);
    // refresh on first pull or when the day changes
    if (this.storeDetails.storeId === 0 || new Date().getDay() !== this.persist.get('DOW')) {
      this.persist.set('DOW', new Date().getDay());
      this.retreiveStoreDetails(this.storeNumber);
      // Update store feature map and set language for new store selected
      this.retreiveStoreFeaturesMap();
      this.retreiveStoreDefaultLanguage();
    }
  }

  getStoreInfo(storeNumber: number) {
    const homeStore = this.storeNumber;
    // switch store number to provide search details
    this.storeNumber = storeNumber;
    this.persist.set('storeNumber', storeNumber);
    this.retreiveStoreDetails(this.storeNumber);
    // revert store back to its original value
    this.storeNumber = homeStore;
    this.persist.set('storeNumber', homeStore);
  }

  getStoreId() {
    if (this.persist.containsKey('storeDetails')) {
      this.storeDetails = this.persist.get('storeDetails');
    }
    return this.storeDetails.storeId;
  }

  /*
   * function to get the selected language object
   */
  getLanguageObj() {
    if (this.persist.containsKey('language')) {
      this.language = this.persist.get('language');
    }
    return this.language;
  }

  /*
   * function to return just the value of the selected language
   */
  getLanguageValue() {
    if (this.persist.containsKey('language')) {
      this.language = this.persist.get('language');
    }
    return this.language.value;
  }

  getSpecifiedLanguage(lang) {
    for ( let i = 0; i < this.languages.length; i++) {
      if (this.languages[i].value === lang) {
        this.language = this.languages[i];
      }
    }
  }

  /*
   * function to Set the language
   */
  setLanguage(language) {
    this.language = language;
    this.persist.set('language', language);
  }

  /*
   * function to get all possible languages
   */
  getLanguages() {
    return this.languages;
  }

  retreiveStoreDefaultLanguage() {
    return this.http.get(this.rootUrl + this.getStoreNumber() + '/language')
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.storeLangErr')))).subscribe(
        data => {
          // Set the default language for the store
          if (data['defaultLanguage'] === 'en_US') {
            this.language = {'name': 'English', 'value': 'en_US', 'icon': 'flag-us'};
          } else if (data['defaultLanguage'] === 'en_CA') {
            this.language = {'name': 'English', 'value': 'en_CA', 'icon': 'flag-ca'};
          } else if (data['defaultLanguage'] === 'fr_CA') {
            this.language = {'name': 'Français', 'value': 'fr_CA', 'icon': 'flag-ca'};
          }
          this.setLanguage(this.language);

          if (this.languages.length === 0) {
            // Populate the available store languages only on initial page load
            data['fr_CA'] ? this.languages.splice(0, 0, {'name': 'Français', 'value': 'fr_CA', 'icon': 'flag-ca'}) : null;
            data['en_CA'] ? this.languages.splice(0, 0, {'name': 'English', 'value': 'en_CA', 'icon': 'flag-ca'}) : null;
            data['en_US'] ? this.languages.splice(0, 0, {'name': 'English', 'value': 'en_US', 'icon': 'flag-us'}) : null;
          }
        });
  }

  /*
   * Get store details from Database
   */
  retreiveStoreDetails(storeNumber) {
    return this.http.get(this.rootUrl + storeNumber + '/details')
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.storeDetailsErrTimeout')))).pipe(
        take(1)
      ).subscribe(
        data => {
          const result: any = data;
          this.storeDetails = result;
          this.persist.set('storeDetails', result);
          this.storeDetailsLoaded.next(true);
        },
        (error) => {
          throw new CustomSBError(
            this.translate.instant('COMMON.error.storeDetailsErr') + storeNumber,
            this.translate.instant('COMMON.error.storeDetailsErr') + storeNumber, false);
        });
  }

  /*
   * Get store details from Database
   */
  retreiveStoreDetailsStoreSearch(storeNumber) {
    return this.http.get(this.rootUrl + storeNumber + '/details');
  }

  /**
   * getter for storeDetails
   * @return returns the storeDetails variable
   */
  getStoreDetails() {
    return this.storeDetails;
  }

  getCountry() {
    return this.storeDetails.country.shortName;
  }

  /*
   * Get store features Map from Database
   */
  retreiveStoreFeaturesMap() {
    return this.http.get(this.rootUrl + this.getStoreNumber() + '/features/map')
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.storeDetailsErrTimeout')))).subscribe(
        data => {
          this.storeFeatures = data;
          this.persist.set('storeFeatures', this.storeFeatures);
        });
  }

  // check if store has feature
  isStoreFeature(key) {
    if (this.storeFeatures) {
      return this.storeFeatures.hasOwnProperty(key);
    } else if (this.persist.containsKey('storeFeatures')) {
      return this.persist.get('storeFeatures').hasOwnProperty(key);
    }
    return false;
  }

  getStoreFeatureValue(key) {
    if (this.storeFeatures) {
      return this.storeFeatures[key];
    } else if (this.persist.containsKey('storeFeatures')) {
      return this.persist.get('storeFeatures')[key];
    }
    return null;
  }

  contactSBTeam(userMessage) {
    return this.http.post(this.rootUrl + 'contact?storeId='+ this.getStoreNumber(), userMessage, {observe: 'response'})
      .timeoutWith(10000, Observable.throw(new Error(this.translate.instant('COMMON.error.ContactErr'))));
  }

  checkForStoreNum () {
    if (this.getStoreNumber()) {
      this.setStoreNumber(this.getStoreNumber());
    }
  }

}