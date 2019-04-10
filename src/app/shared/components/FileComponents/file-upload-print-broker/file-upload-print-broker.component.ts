import {AfterContentInit, Component, EventEmitter, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';
import {CommonConstants} from '@app/config/common-constants';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';

@Component({
  selector: 'app-file-upload-print-broker',
  templateUrl: './file-upload-print-broker.component.html',
  styleUrls: ['./file-upload-print-broker.component.css']
})
export class FileUploadPrintBrokerComponent implements OnInit, OnDestroy, AfterContentInit {

  public fileList: any = [];
  public invalidFileList: any = [];
  public file;
  files: FileList;
  public settingsLoaded = false;
  public fileUploading = false;
  public fileUploaded = false;
  public previewUrl = '';
  public proceedDisabled = true;
  public nativeChecked = false;
  public innerHeight;
  public pbResults: PrintBrokerResponse;
  public selectedTab = 0;
  public step = 0;
  public showChangeFileWarning = false;
  origFileCB = false;
  public subscription: Subscription;
  private allowed_extensions: Array<string> = CommonConstants.ALLOWED_FILE_TYPES;
  public fileTypeNotSupported = false;

  public uploadEvent = new EventEmitter<PrintBrokerResponse>();
  public errorMsg = new EventEmitter<string>();
  public  isWesUpload = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileUploadService: FileUploadService,
    public orderConfigService: OrderConfigService,
    public sharedDataService: SharedDataService,
    public translate: TranslateService,
    public storeInfoService: StoreinfoService
  ) { }

  ngOnInit() {
    if (this.data.isWesUpload) {
      this.orderConfigService.activeJob.usePrintReadyFile = false;
      this.nativeChecked = true;
    }

    this.innerHeight = window.innerHeight - 110;

    this.fileUploadService.setupPrintBroker().then((success) => {
        this.settingsLoaded = true;
      },
      (error) => {
        this.errorMsg = error;
    });
  }

  // Called after ngOnInit when the component's or directive's content has been initialized.
  ngAfterContentInit() {
    if (this.orderConfigService.activeJob.mediaType !== undefined && this.orderConfigService.activeJob.mediaType !== 3) {
      this.selectedTab = this.orderConfigService.activeJob.mediaType;

      if (this.orderConfigService.activeJob.printBrokerFiles !== undefined &&
        this.orderConfigService.activeJob.printBrokerFiles !== null) {
        if (this.previewUrl) {
          this.orderConfigService.activeJob.usePrintReadyFile = this.previewUrl.includes('PrintReady');
        } else {
          this.orderConfigService.activeJob.usePrintReadyFile = false;
          this.previewUrl = this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions[0].fileUrl;
        }
        this.pbResults = this.orderConfigService.activeJob.printBrokerFiles;
        this.sharedDataService.wesFileName = this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions[0].fileName;
        this.setStep(1);
        this.fileUploaded = true;
      }
    }
  }

  onFilesChange(fileList: Array<File>) {
    this.fileList = fileList;
    this.file = fileList[0];
    this.autoUploadFile();
  }

  autoUploadFile() {
    this.fileUploading = true;
    this.sharedDataService.configPageIsLoaded = false;
    this.fileUploadService.preflightFile(this.file, this.isWesUpload).then(success => {
      let result: PrintBrokerResponse;
      result = success;
      this.pbResults = result;
      this.uploadEvent.emit(result);
      this.fileUploading = false;
      this.fileUploaded = true;
      this.previewUrl = result.fileDescriptions[1].fileUrl;
      this.setStep(1);
      this.proceedDisabled = false;
      this.sharedDataService.wesFileLink = result.fileDescriptions[0].fileUrl;
      this.sharedDataService.wesFileName = this.file.name;
    }, error => {
      this.fileUploading = false;
      this.errorMsg.emit(error);
    });
  }

  onInvalidFiles(invalidFileList: Array<File>) {
    this.invalidFileList = invalidFileList;
  }

  fileSelected(file) {
    this.file = file;
    const ext = this.file.name.split('.')[this.file.name.split('.').length - 1];
    if (this.allowed_extensions.lastIndexOf(ext.toLowerCase()) !== -1) {
      this.fileTypeNotSupported = false;
      this.autoUploadFile();
    } else {
      this.fileTypeNotSupported = true;
      this.proceedDisabled = true;
      this.fileUploaded = false;
      this.previewUrl = '';
      this.file = null;
      this.pbResults = null;
      this.orderConfigService.activeJob.printBrokerFiles = undefined;
      this.sharedDataService.wesFileLink = '';
      this.sharedDataService.wesFileName = '';
    }
  }

  updateUploadType(checkBoxChangeEvent) {
    this.orderConfigService.activeJob.usePrintReadyFile = !checkBoxChangeEvent.checked;
  }

  ngOnDestroy (): void {
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }


}
