import { Component, OnInit, OnDestroy, ViewContainerRef  } from '@angular/core';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import {Subscription} from 'rxjs';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {CustomSBError} from '@app/errors/CustomErrorObjects/CustomSBError';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {ConfigurationScreenService} from '@app/shared/services/configuration-screen/configuration-screen.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';


@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit, OnDestroy {

  templateId: string;
  count = 0;
  turnTime = '';

  private locationSubscription: any;
  private sub: any;
  private errorMsgs: any;
  private configMsgs: any;
  private showSideBarSub: Subscription;
  public showSideBar = true;

  constructor(
        private route: ActivatedRoute,
        private configService: ConfigurationScreenService,
        private orderConfigService: OrderConfigService,
        private location: Location,
        private router: Router,
        private translate: TranslateService,
        public dialog: MatDialog,
        public canDeactivateGuardService: CanDeactivateGuardService,
        private notificationService: NotificationService,
        private fileUploadService: FileUploadService,
        public sharedDataService: SharedDataService,
        private LOGGER: LoggerService
  ) {}

    ngOnInit() {
        this.notificationService.showLoader();
        this.locationSubscription = this.location.subscribe(x => this.LOGGER.debug(x));
        this.showSideBarSub = this.sharedDataService.notifyMenuChangeObservable$.subscribe(( res ) => {
          this.showSideBar = res;
        });

        if (!this.orderConfigService.getIsReorder()) {

            this.sub = this.route.queryParams.subscribe(params => {
              this.LOGGER.debug('Config Page params ');
              this.LOGGER.debug(params);

              this.notificationService.showLoader();

              if (params.product && !this.orderConfigService.activeJob.isDuplicate) {
                this.templateId = params.product;
                  this.configService.retrieveGroupKeyOptions(this.templateId, null).subscribe( result => {
                    const data: any = result;

                    if (data.quantities && data.quantities.length > 0) {
                      this.orderConfigService.activeJob.quantity = data.quantities[0];
                      this.orderConfigService.setJobQuantities(data.quantities);
                    }

                    const optionDetailsData = {};
                    data.attributeOptions.optionDetailList.forEach( option => {
                        const temp = {};
                        option.attributeProperties.forEach( property => {
                            temp[property.propertyName] = property.propertyValue;
                        });
                        option.attributePropertyMap = temp;
                        optionDetailsData[option.id] = option;
                    });

                    data.productDetails = optionDetailsData;

                    this.orderConfigService.activeJob =
                      this.orderConfigService.setActiveJobTyped(data, this.orderConfigService.activeJob);

                    // Process XML file from print broker if it exists
                    if (!this.processFileData()) {
                      this.callPricingAndTicketing(null);
                    }

                    this.orderConfigService.templateDoneLoading.next(true);

                    // If Finishing Only product type then set to No File and bypass the file type modal
                    this.orderConfigService.activeJob.productId === 'T1967507' ?
                      this.orderConfigService.activeJob.mediaType = 2 : this.orderConfigService.activeJob.mediaType = 3;
                    if ( this.orderConfigService.activeJob.mediaType === 3) {
                      this.showFileDialog(this.orderConfigService.isWorkFrontJob(this.orderConfigService.activeJob.productId));
                    }
                  });
              } else if (params.product && this.orderConfigService.activeJob.isDuplicate ) {
                // if duplicating job then the active config job can remain the same
                this.notificationService.hideLoader();
              } else if ( params.job ) {
                this.templateId = params.job;
                if (this.orderConfigService.cartCount() > 0) {
                    this.orderConfigService.changeActiveJob(this.templateId);
                    this.notificationService.hideLoader();
                } else {
                    this.router.navigate(['/']);
                }
              } else {
                this.router.navigate(['/']);
              }
            });
        } else {
            this.notificationService.hideLoader();
            this.orderConfigService.setIsReorder(false);
        }

        this.translate.get('CONFIG').subscribe(
            data => {
                this.configMsgs = data;
            }
        );
}

  callPricingAndTicketing(option) {
    const funcStart = performance.now();
    this.configService.getPricingandConditionalTicketing(
      this.orderConfigService.createTicketingAndPricingObject( option, false , 'CP')).subscribe( pAndCRe => {
      const pAndC: any = pAndCRe;
      if (pAndC === null || pAndC === undefined) {
        const msg = 'A pricing and Conditional Ticketing error occured.';
        this.notificationService.hideLoader();
        throw new Error(msg);
      }
      this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
      for (let i = 0; i < pAndC.jobs.length; i ++) {
        if ( pAndC.jobs[ i ].activeJob ) {
          this.orderConfigService.processConditionalTicketing(pAndC.jobs[ i ]);
        }
      }
      this.notificationService.hideLoader();
    });
    this.LOGGER.info(performance.now() - funcStart);
  }

  ngOnDestroy(): void {
      if (!this.orderConfigService.getIsReorder() && this.sub) {
          this.sub.unsubscribe();
      }
      if (this.showSideBarSub) {
        this.showSideBarSub.unsubscribe();
      }
      this.locationSubscription.unsubscribe();
  }

  canDeactivate(nextState: RouterStateSnapshot): Observable<boolean> | boolean {

    this.notificationService.hideLoader();
    if (this.checkNewUrl(nextState)) {
        return true;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
        data: { message: this.configMsgs.routerGuard }
    });

    return dialogRef.afterClosed();
  }

  // Checks to see if url routed to needs confirmation dialog or not
  checkNewUrl(nextState: RouterStateSnapshot) {
    if ( nextState.url.includes('/error' )) {
        return true;
    }

    if ((nextState.url === '/checkout' && this.canDeactivateGuardService.checkoutButtonActive) ||
         nextState.url === '/product' ||
        (nextState.url === '/' && this.canDeactivateGuardService.deleteOrderActive) ||
         this.canDeactivateGuardService.jobTabActive ||
        (nextState.url === '/search' && this.canDeactivateGuardService.deleteOrderActive)) {
          this.canDeactivateGuardService.checkoutButtonActive = false;
          this.canDeactivateGuardService.deleteOrderActive = false;
          this.canDeactivateGuardService.jobTabActive = false;
          return true;
    } else {
        return false;
    }
  }

  processFileData() {
    if (this.orderConfigService.activeJob.printBrokerFiles &&
      this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions.length > 1) {
      this.notificationService.showLoader();
      this.fileUploadService.getXMLFile(this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions[2]
        .fileUrl).subscribe(result2 => {
        this.orderConfigService.processFileData(this.fileUploadService.processXMLFile(result2));
        this.callPricingAndTicketing(null);
      });
      return true;
    }
    return false;
  }

  processPricing() {
    this.configService.getPricingandConditionalTicketing(
      // passing null to createTicketingAndPricingObject sets conditional ticketing to 'N'
      this.orderConfigService.createTicketingAndPricingObject(null, false, 'P')).subscribe(pc => {
      const pAndC: any = pc;
      if (pAndC === null || pAndC === undefined) {
        this.notificationService.hideLoader();
        throw new CustomSBError(this.errorMsgs.pAndCError, this.errorMsgs.pAndCErrorName, false);
      }
      this.orderConfigService.processPricing(pAndC.orderPricing, pAndC.jobs);
      this.notificationService.hideLoader();
    });
  }

  showFileDialog(workfront: boolean) {
    const dialogRef = this.dialog.open(FileUploadComponent, {
      width: '800px',
      height: 'auto',
      data: {isWesUpload: false, isWorkFront: workfront}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderConfigService.fileUploadedSub.next(true);

        this.processFileData();

        if (this.orderConfigService.activeJob.mediaType === 1
          || this.orderConfigService.activeJob.mediaType === 2) {
          this.orderConfigService.activeJob.printBrokerFiles = null;
        }
      } else {
        this.sharedDataService.configPageIsLoaded = true;
      }

    });
  }
}
