import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';
import {QuoteDetailJ} from '@app/models/QuoteDetailJ';
import {QuoteSearch} from '@app/models/QuoteSearch';
import {QuoteJob} from '@app/models/QuoteJob';
import {QuoteParams} from '@app/models/QuoteParams';
import {ManageQuotesV} from '@app/models/ManageQuotesV';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {environment} from '@env/environment';


@Injectable()
export class QuotesService {
  rootUrl = environment.rootApiUrl + '/quotes/';
  public readonly defaultTab = 1;
  public currentAccordianTab = 0;

  public path = '';

  private selectedQuoteSource = new BehaviorSubject<any>('');
  public quoteList = new BehaviorSubject<ManageQuotesV[]>(null);
  public enteredPage: Boolean = true;
  currentSelectedQuote = this.selectedQuoteSource.asObservable();

  constructor(
    private storeInfoService: StoreinfoService,
    private http: HttpClient
  ) {
  }

  setSelectedQuote(quoteNumber: string) {
    this.selectedQuoteSource.next(quoteNumber);
  }

  retrieveQuotesByStoreNumber(storeId: number) {
    return this.http.get<ManageQuotesV[]>(this.rootUrl + '?storeId=' + storeId)
      .timeoutWith(900000, Observable.throw(new Error('Error fetching quote history, call timed out')));
  }

  retrieveQuotesList(storeId: number, model: QuoteSearch) {
    let urlParamsString = 'lookup?storeNumber=' + storeId;
    for (const param in model) {
      if (model[param] != null && param !== 'status') {
        urlParamsString += '&' + param + '=' + model[param];
      }
    }
    if (model.status != null && model.status.length > 0) {
      urlParamsString += '&status=';
      for (const s of model.status) {
        urlParamsString += s + '%2C%20';
      }
      urlParamsString = urlParamsString.substr(0, urlParamsString.length - 6);
    }
    return this.http.get<ManageQuotesV[]>(this.rootUrl + urlParamsString)
      .timeoutWith(900000, Observable.throw(new Error('Error searching for quotes, call timed out')));
  }

  retrieveQuoteDetailByQuoteNumber(quoteNumber: string) {
    return this.http.get<QuoteDetailJ>(this.rootUrl + quoteNumber)
      .timeoutWith(900000, Observable.throw(new Error('Error fetching quote history, call timed out')));
  }

  updateQuoteDetails(quoteNumber: string, quoteJobs: QuoteJob[]) {
    return this.http.put(this.rootUrl + quoteNumber, quoteJobs)
      .timeoutWith(900000, Observable.throw(new Error('Error updating quote, call timed out')));
  }

  nextAccordianTab() {
    this.currentAccordianTab++;
  }

  prevAccordianTab() {
    this.currentAccordianTab--;
  }

  setAccordianTab(index: number) {
    this.currentAccordianTab = index;
  }

  getAccordianTab() {
    return this.currentAccordianTab;
  }

  updateQuoteStatus(quote: QuoteParams) {
    switch (quote.status) {
      case 40 : {
        this.path = 'lost';
        break;
      }
      case 41 : {
        this.path = 'won';
        break;
      }
      case 43 : {
        this.path = 'cancelled';
        break;
      }
    }
    return this.http.put(this.rootUrl + quote.quoteNumber + '/status/' + this.path, quote)
      .timeoutWith(10000, Observable.throw(new Error('Error updating Quote status, call timed out')));
  }

}
