import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import {DuplicateJobComponent} from '@app/shared/components/duplicate-job/duplicate-job.component';
import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {ConfirmationDialogComponent} from '@app/shared/components/ConfirmationDialog/ConfirmationDialog.component';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {TranslateService} from '@ngx-translate/core';
import {CommonConstants} from '@app/config/common-constants';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-job-tabs',
  templateUrl: './job-tabs.component.html',
  styleUrls: ['./job-tabs.component.css']
})
export class JobTabsComponent implements OnInit {

    showSideBar: Boolean = false;
    private subscription: Subscription;
    private sub: Subscription;
    public templateId = '';
    jobkeyList = new Observable<any>();
    isNewProduct = false;
    isNewJob = false;
    configMsgs: any;
    public pbResults: PrintBrokerResponse;
    constructor(
            public sharedDataService: SharedDataService,
            public orderConfigService: OrderConfigService,
            private router: Router,
            private route: ActivatedRoute,
            public dialog: MatDialog,
            public translate: TranslateService,
            private notificationService: NotificationService,
            private canDeactivateGuardService: CanDeactivateGuardService
    ) { }

    ngOnInit() {

        this.jobkeyList = this.orderConfigService.getCart();

        this.orderConfigService.cartChanged.subscribe(
            data => {            
                this.isNewJob = !this.isNewProduct;      
                this.jobkeyList = this.orderConfigService.getCart();
            }
        );

        this.orderConfigService.newProdAddedToCart.subscribe(
            data => {
                if (this.isNewProduct) {
                    this.isNewJob = false;
                }
            }
        );

        this.subscription = this.sharedDataService.notifyMenuChangeObservable$.subscribe(( res ) => {
            this.showSideBar = res;
        });

        this.sub = this.route.queryParams.subscribe(params => {

            if (params.product) { 
              this.templateId = params.product;
              this.isNewJob = true;
              this.isNewProduct = true;
            } else {
              this.templateId = params.job;
              this.isNewJob = false;
              this.isNewProduct = false;
            }
        });

        this.orderConfigService.jobCancelled.subscribe(
            data => {
                if (data) {
                    this.isNewJob = false;
                }
            }
        )

        // PSB-1879
        this.orderConfigService.isEditJob = this.orderConfigService.isReorder;

        this.translate.get('CONFIG').subscribe(
            data => {
                this.configMsgs = data;
            }
        );
    }

    changeActiveJob(jobNumber) {
        if (this.isNewJob) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '250px',
                data: { message: 'Add ' + this.orderConfigService.activeConfigProduct.name + ' to the cart?' }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.canDeactivateGuardService.jobTabActive = true;
                    this.orderConfigService.addToCart();
                    this.changeTab(jobNumber);
                } else {
                    this.canDeactivateGuardService.jobTabActive = true;
                    this.changeTab(jobNumber);
                }
            });
        } else if (this.activeJobEdited()) {
            this.changeTab(jobNumber);
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: '250px',
                data: {
                message: 'Changes have been made to ' + this.orderConfigService.activeConfigProduct.name
                    + '. Would you like to save before continuing?'
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.orderConfigService.updateActiveJob();
                }
                this.router.navigate(['/config'], { queryParams: { job: jobNumber } }).then(
                success => {
                    if (success) {
                    this.orderConfigService.changeActiveJob(jobNumber);
                    if (this.orderConfigService.activeJob.printBrokerFiles) {
                        this.pbResults = this.orderConfigService.activeJob.printBrokerFiles;
                    } else {
                        this.pbResults = CommonConstants.SAMPLE_FILES;
                    }
                    this.orderConfigService.fileUploadedSub.next(true);
                    }
                }
                );
            });
        } else {
            this.router.navigate(['/config'], { queryParams: { job: jobNumber } }).then(
                success => {
                    if (success) {
                    this.orderConfigService.changeActiveJob(jobNumber);
                    if (this.orderConfigService.activeJob.printBrokerFiles) {
                        this.pbResults = this.orderConfigService.activeJob.printBrokerFiles;
                    } else {
                        this.pbResults = CommonConstants.SAMPLE_FILES;
                    }
                    this.orderConfigService.fileUploadedSub.next(true);
                    }
                }
            );
        }
    }

    changeTab(jobNumber) {
      for (const job in this.orderConfigService.cart) {
        if (JSON.stringify(this.orderConfigService.cart[job]) === JSON.stringify(this.orderConfigService.activeJob)) {
          this.router.navigate(['/config'], { queryParams: { job: jobNumber } }).then(
            success => {
              if (success) {
                this.orderConfigService.changeActiveJob(jobNumber);
                if (this.orderConfigService.activeJob.printBrokerFiles) {
                  this.pbResults = this.orderConfigService.activeJob.printBrokerFiles;
                } else {
                  this.pbResults = CommonConstants.SAMPLE_FILES;
                }
                this.orderConfigService.fileUploadedSub.next(true);
              }
            }
          );
        }
      }
    }

    removeJobFromOrderName(jobName) {
        if (this.orderConfigService.orderName === this.orderConfigService.orderName.replace(', ' + jobName, '')) {
          this.orderConfigService.orderName = this.orderConfigService.orderName.replace(jobName + ', ', '');
        } else {
          this.orderConfigService.orderName = this.orderConfigService.orderName.replace(', ' + jobName, '');
        }
      }
      
      deleteJobFromCart(jobNumber) {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { message: 'Delete ' + this.orderConfigService.cart[jobNumber].configProduct.name + ' from the order?' }
        });

        dialogRef.afterClosed().subscribe(result => {
        if (result) {
            if (this.orderConfigService.isOrderNameDefault) {
                this.removeJobFromOrderName(this.orderConfigService.cart[jobNumber].configProduct.name);
            }

            const previousActiveJob = this.orderConfigService.getActiveJob().jobNumber;
            this.orderConfigService.deleteJobFromCart(jobNumber);
            this.canDeactivateGuardService.jobTabActive = true;
            
            if (this.orderConfigService.cartCount() > 0 || !this.orderConfigService.cart[previousActiveJob]) {
                if (previousActiveJob == jobNumber) {
                    let newJobNumber;
                    for (const item in this.orderConfigService.cart) {
                        newJobNumber = item;
                        break;
                    }
                    this.orderConfigService.changeActiveJob(newJobNumber);
                    this.orderConfigService.isEditJob = true;
                    this.router.navigate(['/config'], {queryParams: {job: newJobNumber}});
                    this.isNewJob = false;
                } else {
                    if (this.orderConfigService.cart[previousActiveJob]) {
                        if (jobNumber < previousActiveJob) {
                            let newJobNumber = previousActiveJob - 1;
                            this.orderConfigService.changeActiveJob(newJobNumber);
                            this.router.navigate(['/config'], {queryParams: {job: newJobNumber}});
                        }
                        this.orderConfigService.isEditJob = true;
                        this.isNewJob = false;
                    } else {
                        this.isNewJob = true;
                        this.orderConfigService.isEditJob = false;
                    }
                }
            } else if (previousActiveJob != jobNumber) {
                let newJobNumber = 1;
                this.orderConfigService.activeJob.jobNumber = newJobNumber;
                this.orderConfigService.changeActiveJob(newJobNumber);
                this.router.navigate(['/config'], {queryParams: {job: newJobNumber}});
                this.isNewJob = true;
                this.orderConfigService.isEditJob = true;
            } else {
                this.orderConfigService.resetActiveJobFileInfo();
                this.router.navigate(['/product']);
            }
        }
        });
    }

    deleteActiveJob() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { message: 'Delete ' + this.orderConfigService.activeConfigProduct.name + ' from the order?' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (this.orderConfigService.cartCount() > 0) {
                    const newJobNumber = parseInt(Object.keys(this.orderConfigService.cart)[0], 10);
                    this.orderConfigService.changeActiveJob(newJobNumber);
                    this.canDeactivateGuardService.jobTabActive = true;
                    this.router.navigate(['/config'], {queryParams: {job: newJobNumber}});
                } else {
                    this.orderConfigService.resetActiveJobFileInfo();
                    this.router.navigate(['/product']);
                }
            }
        });
    }

    addTabToCartAndProceed() {
      if (this.isNewJob) {
        this.orderConfigService.addToCart();
      }

      this.router.navigate(['/config'], {queryParams: {job: this.orderConfigService.getActiveJob().jobNumber}}).then(
          success => {
              this.dialog.open(DuplicateJobComponent, {
                width: '360px',
                height: '500px',
                data: { name: 'Added to cart' },
                disableClose: true
              });
          }
      );
    }

    changeJobNameActive(event) {
        this.orderConfigService.activeConfigProduct.name = event.target.innerText;
    }

    changeJobName(event, key) {
        this.orderConfigService.cart[key].configProduct.name = event.target.innerText;
        this.changeJobNameActive(event);
    }

    activeJobEdited(): boolean {
        return JSON.stringify(this.orderConfigService.activeJob) !== JSON.stringify(this.orderConfigService.cart[this.orderConfigService.activeJob.jobNumber]);
    }
}
