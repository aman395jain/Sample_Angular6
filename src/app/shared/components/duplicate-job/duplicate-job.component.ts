import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {CanDeactivateGuardService} from '@app/core/Services/can-deactivate-guard/can-deactivate-guard.service';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {environment} from '@env/environment';
import {ValidatorsService} from '@app/shared/services/validators/validators.service';
import {OrderService} from '@app/shared/services/order/order.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';


@Component({
  selector: 'app-duplicate-job',
  templateUrl: './duplicate-job.component.html',
  styleUrls: ['./duplicate-job.component.css']
})
export class DuplicateJobComponent {

    toolTipPosition = 'below';
    public isStatusUpdate = false;
    public addToCartCoupon: any;
    public showCoupon = true;
    couponImg: any;

  constructor(
          public dialogRef: MatDialogRef<DuplicateJobComponent>,
          private translate: TranslateService,
          public dialog: MatDialog,
          public validators: ValidatorsService,
          public orderConfigService: OrderConfigService,
          public fileService: FileUploadService,
          public canDeactivateGuardService: CanDeactivateGuardService,
          public storeinfo: StoreinfoService,
          private notificationService: NotificationService,
          private router: Router,
          private orderService: OrderService,
          @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      if (data.isUpdateOn) {
        this.isStatusUpdate = true;
      }

      this.orderService.getAddtoCartCoupon().subscribe(
        ( result ) => {
          this.addToCartCoupon = result;
          this.couponImg = environment.rootApiUrl + '/file/' + this.addToCartCoupon.imageUrl;
        }
      );
  }

  sameFile() {
      this.dialogRef.close();
      this.data = this.orderConfigService.getTemplate();
      this.orderConfigService.activeJob.isDuplicate = true;
      this.router.navigate(['/config'], {queryParams: {product: this.data.productId}});
      this.orderConfigService.activeJob.jobNumber = this.orderConfigService.jobIdCounter;
      this.orderConfigService.cartChanged.next(true);
      this.orderConfigService.isEditJob = false;
  }

  newFile() {
      this.dialogRef.close();
      this.data = this.orderConfigService.getTemplate();
      this.orderConfigService.resetActiveJobFileInfo();
      this.orderConfigService.activeJob.isDuplicate = true;
      this.orderConfigService.activeJob.jobNumber = this.orderConfigService.jobIdCounter;
      this.router.navigate(['/config'], {queryParams: {product: this.data.productId}});
      this.orderConfigService.cartChanged.next(true);
      this.orderConfigService.isEditJob = false;
      this.orderConfigService.fileUploadedSub.next(true);
      this.openFileSelectionDialog();
  }

  addProduct() {
    this.dialogRef.close();
    this.orderConfigService.allowCancel.next(false);
    this.orderConfigService.activeJob.selectedTurnTime = null;
    this.orderConfigService.activeJob.isDuplicate = false;
    this.orderConfigService.activeJob.jobNumber = this.orderConfigService.jobIdCounter;
    this.orderConfigService.resetActiveJobFileInfo();
    this.router.navigate(['/product']);
  }

  checkout() {
      this.dialogRef.close();
      this.orderConfigService.checkTurnTimeSelectionCompleted();
      this.canDeactivateGuardService.checkoutButtonActive = true;
      this.router.navigate(['/checkout']);
  }

  stayOnPage() {
    this.dialogRef.close();
    this.orderConfigService.isEditJob = true;
  }

  openFileSelectionDialog() {
    // TODO add logic to pass if Workfront job
    const dialogRef = this.dialog.open(FileUploadComponent, {
        width: '800px',
        height: 'auto',
        data: { isWesUpload: false }
      });

      dialogRef.afterClosed().subscribe(
          result => {
            // this.orderConfigService.cartChanged.next(true);
            // this.orderConfigService.fileUploadedSub.next(true);
            // this.data = this.orderConfigService.getTemplate();
            // this.orderConfigService.activeJob.jobNumber = this.orderConfigService.jobIdCounter;
            // this.router.navigate(['/config'], {queryParams: {product: this.data.productId}});
            // this.orderConfigService.isEditJob = false;
          }
      );

      // TODO
      // Set file in active job to selection from fileUploadComponent
  }

  couponClicked($event) {
    this.showCoupon = !this.showCoupon;
  }

}
