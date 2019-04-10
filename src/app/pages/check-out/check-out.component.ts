import {Component, OnDestroy, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css'],
  animations: [
      trigger('slideInOut', [
          state('false', style({

          })),
          state('true', style({
              opacity: '0',
              overflow: 'hidden',
              width: '0px',
              'max-width': '0px',
              margin: '0',
              'max-height': '0px'
          })),
          transition('false => true', animate('200ms ease-in-out')),
          transition('true => false', animate('200ms ease-in-out'))
      ]),
      trigger('grow', [
          state('false', style({
          })),
          state('true', style({
              'max-width': '100%',
              width: '100%',
              flex: '0 0 100%'
          })),
          transition('false => true', animate('200ms ease-in-out')),
          transition('true => false', animate('200ms ease-in-out'))
      ])
  ]
})
export class CheckOutComponent implements OnInit, OnDestroy {

  public reviewStep = false;
  private reviewStepSub: Subscription;


  constructor(
          public translate: TranslateService,
          public orderConfigService: OrderConfigService,
          public sharedDataService: SharedDataService,
          public canDeactivateGuardService: CanDeactivateGuardService,
          public storeInfoService: StoreinfoService
        ) { }

  ngOnInit() {
    this.canDeactivateGuardService.checkoutButtonActive = false;
    this.sharedDataService.orderReviewStep.subscribe( value => {
      this.reviewStep = value;
    });
  }

  ngOnDestroy(): void {
    if (this.reviewStepSub) {
        this.reviewStepSub.unsubscribe();
    }
  }

}
