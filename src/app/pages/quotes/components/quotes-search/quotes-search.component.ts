import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {FormControl} from '@angular/forms';
import {QuoteSearch} from '@app/models/QuoteSearch';
import {User} from '@app/models/User';
import {QuotesService} from '@app/pages/quotes/services/quotes/quotes.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';


@Component({
  selector: 'app-quotes-search',
  templateUrl: './quotes-search.component.html',
  styleUrls: ['./quotes-search.component.css']
})
export class QuotesSearchComponent implements OnInit {

  model: QuoteSearch = new QuoteSearch(null, null, null, null);
  lastName = this.validators.getNameVal();
  company = this.validators.getCompanyVal();
  quoteNumber = this.validators.getOrderNumberVal();
  storeNumber = this.validators.getStoreNumberVal();
  isQuoteDeskViewUser = false;

  disableField = {'retail': false,
  'quoteNumber': false};

  errorMsgs;
  statusOptions = new FormControl();
  statusOptionsList: string[] = [];
  statusOptionsChosen: string[] = [];


  constructor(
    public quotesService: QuotesService,
    private notificationService: NotificationService,
    public userInfoService: UserInfoService,
    public translate: TranslateService,
    public validators: ValidatorsService,
    public storeService: StoreinfoService
  ) { }

  ngOnInit() {
    this.storeNumber = undefined;
    this.isQuoteDeskViewUser = this.userInfoService.hasRole(User.USER_ROLE_QUOTEDESK);

    this.translate.get('COMMON.error').subscribe(result => {
      this.errorMsgs = result;
    });

    this.translate.get('QUOTES.statusOptions').subscribe(result => {
      const statusResult: string[] = Object.values(result);
      for (const value of statusResult) {
        this.statusOptionsList.push(value);
      }

      this.statusOptionsChosen.push(result['atQuoteDesk']);
      this.statusOptionsChosen.push(result['pending']);
    });
  }

  emptyStatusOptions() {
    this.statusOptionsChosen = [];
  }

  disableSearchFields(event, field) {
      if (event == null || event.length === 0) {
          for ( const key in this.disableField) {
              this.disableField[key] = false;
           }
          return;
      }

      if (field === 'retail') {
          this.disableField.retail = true;
      }
      if (field === 'quoteNumber') {
          this.disableField.quoteNumber = true;
      }
  }

  onSearch() {
    this.notificationService.showLoader();

    this.model.status = this.statusOptionsChosen;

    let strNumb;
    if (this.storeNumber === undefined) {
      strNumb = this.storeService.getStoreNumber();
    } else {
      strNumb = this.storeNumber;
    }

    this.quotesService.retrieveQuotesList(strNumb, this.model).subscribe(
      data => {
        this.quotesService.quoteList.next(data);
        this.quotesService.nextAccordianTab();
        this.notificationService.hideLoader();
      }, error => {
        this.notificationService.hideLoader();
        throw new Error(this.errorMsgs.quoteSearch);
      }
    );
  }

}
