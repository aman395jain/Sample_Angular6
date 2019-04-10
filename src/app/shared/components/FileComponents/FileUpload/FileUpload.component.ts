import {
  Component, OnInit, Inject, OnDestroy, ViewChild, AfterContentInit,
  ComponentFactoryResolver, ViewContainerRef, ComponentFactory, ComponentRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { hinge } from 'ng-animate';
import { transition, trigger, useAnimation } from '@angular/animations';
import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';
import {CommonConstants} from '@app/config/common-constants';
import {ActiveJob} from '@app/models/ActiveJob';
import {FileUploadMultiFileComponent} from '@app/shared/components/FileComponents/file-upload-multi-file/file-upload-multi-file.component';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {FileUploadPrintBrokerComponent} from '@app/shared/components/FileComponents/file-upload-print-broker/file-upload-print-broker.component';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './FileUpload.component.html',
  styleUrls: ['./FileUpload.component.css'],
  animations: [
    trigger('hinge', [
      transition('false => true', useAnimation(hinge , {
        params: { timing: 2, delay: 1 }
      }))
    ])
  ]
})

export class FileUploadComponent implements OnInit, OnDestroy, AfterContentInit {
  public errorMsg: any;
  public fileUploaded = false;
  public previewUrl = '';
  public proceedDisabled = true;
  public nativeChecked = false;
  @ViewChild('tabGroup') tabGroup;
  public innerHeight;
  public isWesUpload;
  public pbResults: PrintBrokerResponse;
  public multiFile: File[];
  public selectedTab = 0;
  public showChangeFileWarning = false;
  public isCancel = false;
  public allowCancel = true;
  public subscription: Subscription;
  private allowed_extensions: Array<string> = CommonConstants.ALLOWED_FILE_TYPES;
  public fileTypeNotSupported = false;
  public hingeError = false;
  public activeJob = new ActiveJob();
  public isFinishingOnly = false;

  @ViewChild('DigitalFileUpload', { read: ViewContainerRef }) digitalFileUploadContainer;
  private uploadEventSub: Subscription;
  private uploadEventErrorSub: Subscription;
  private componentRef: ComponentRef<any>;

  constructor(
    public dialogRef: MatDialogRef<FileUploadComponent>,
    public orderConfigService: OrderConfigService,
    public sharedDataService: SharedDataService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService,
    private LOGGER: LoggerService,
    public storeInfoService: StoreinfoService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.isWesUpload = this.data.isWesUpload;

    if (this.data.activeJob) {
      this.orderConfigService.activeJob = this.data.activeJob;
      this.activeJob = this.data.activeJob;
     // console.log("using job passed in: "+ JSON.stringify(this.activeJob));
    } else {
      this.activeJob = this.orderConfigService.activeJob;
    }

    if (this.data.isWesUpload === true) {
      this.activeJob.usePrintReadyFile = false;
      this.nativeChecked = true;
    }

    this.subscription = this.orderConfigService.allowCancel.subscribe(
      ( result ) => {
        this.allowCancel = result;
      }
    );

    this.subscription = this.orderConfigService.proceedDisabled.subscribe(
      ( result ) => {
        this.proceedDisabled = result;
      }
    );

    this.setupDigitalComponent(this.data.isWorkFront);

    if (this.data.showChangeFileWarning) {
      this.showChangeFileWarning = true;
    }

    this.innerHeight = window.innerHeight - 110;
  }

  // Called after ngOnInit when the component's or directive's content has been initialized.
  ngAfterContentInit() {

    if (this.activeJob.mediaType !== undefined && this.activeJob.mediaType !== 3) {
      this.selectedTab = this.activeJob.mediaType;
        if (this.activeJob.printBrokerFiles !== undefined &&
              this.activeJob.printBrokerFiles !== null) {
            if (this.previewUrl) {
              this.activeJob.usePrintReadyFile = this.previewUrl.includes('PrintReady');
            } else {
              this.activeJob.usePrintReadyFile = false;
              this.previewUrl = this.activeJob.printBrokerFiles.fileDescriptions[0].fileUrl;
            }
           // download function..to set PDF....   pass it in?
           // this.orderConfigService.setFilePreview();

           this.pbResults = this.activeJob.printBrokerFiles;
           this.sharedDataService.wesFileName = this.activeJob.printBrokerFiles.fileDescriptions[0].fileName;
           this.fileUploaded = true;
        }
    }
    // If Finishing Only product type then disable Digital File and Hard Copy tabs
    if (this.activeJob.productId === 'T1967507') {
      this.isFinishingOnly = true;
    }
    this.proceedDisabled = this.selectedTab === 0  && !this.fileUploaded ? true : false;
  }

  setupDigitalComponent(workfront: boolean) {
    let component: any = FileUploadPrintBrokerComponent;
    if ( workfront ) {
      component = FileUploadMultiFileComponent;
    }

    this.digitalFileUploadContainer.clear();
    const factory: ComponentFactory<any> = this.componentFactoryResolver.resolveComponentFactory(component);
    this.componentRef = this.digitalFileUploadContainer.createComponent(factory);

    this.uploadEventSub = this.componentRef.instance.uploadEvent.subscribe(($event) => {
      if ( !workfront ) {
        this.pbResults = $event;
      } else {
        this.multiFile = $event;
      }

      this.proceedDisabled = false;
      this.fileUploaded = true;
    });

    this.uploadEventErrorSub = this.componentRef.instance.errorMsg.subscribe(($event) => {
      this.errorMsg = $event;
    });

    if (!workfront) {
      (<FileUploadPrintBrokerComponent>this.componentRef.instance).isWesUpload = this.isWesUpload;
    }
  }

  selectFileType(notes) {
    if (!this.isCancel) {
      if (this.selectedTab === 0 && !!this.pbResults) {
        this.activeJob.printBrokerFiles = this.pbResults;
        this.activeJob.multipleFiles = null;
      } else if (this.selectedTab === 0 && !!this.multiFile ) {
        this.activeJob.multipleFiles = this.multiFile;
        this.activeJob.printBrokerFiles = null;
      } else {
        this.activeJob.printBrokerFiles = null;
        this.activeJob.multipleFiles = null;
      }
      this.activeJob.mediaType = this.selectedTab;
      if (notes.length > 0) {
        this.activeJob.fileNotes = notes;
      }
      this.dialogRef.close(true);
    }
  }

  ngOnDestroy(): void {
    // set allowCancel value to true to maintain backwards compatibilty with comoponent call
    // that dont set allowCancel value
    this.orderConfigService.allowCancel.next(true);
    this.orderConfigService.proceedDisabled.next(this.proceedDisabled);
    this.subscription.unsubscribe();
    this.uploadEventSub.unsubscribe();
    this.componentRef.destroy();
  }

  tabChanged(tabChangeEvent) {
    this.selectedTab = tabChangeEvent.index;
    this.proceedDisabled = (this.tabGroup.selectedIndex === 0 && (!this.fileUploaded || !this.multiFile));
  }

  onNoClick(): void {
    this.isCancel = true;
    this.dialogRef.close(false);
    this.sharedDataService.configPageIsLoaded = false;
  }

  animateError() {
    this.hingeError = true;
  }
}
