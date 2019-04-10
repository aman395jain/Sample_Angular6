import {Component, Input, OnInit} from '@angular/core';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {take} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-store-info',
  templateUrl: './store-info.component.html',
  styleUrls: ['./store-info.component.css']
})
export class StoreInfoComponent implements OnInit {

  @Input('storeDetails') storeDetails: any;
  public error: String;

  constructor(
    public storeInfoService: StoreinfoService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }


  searchForStoreInfo(storeNumber) {
    this.error = null;
    this.storeInfoService.retreiveStoreDetailsStoreSearch(storeNumber)
      .pipe(
        take(1)
      ).subscribe( storeInfo => {
      this.storeDetails = storeInfo;
    }, error1 => {
      this.storeDetails = null;
      this.error = this.translate.instant('COMMON.error.storeDetailsErr') + storeNumber
      throw new CustomSBError(
        this.error,
        this.error, false);
    });
  }

}
