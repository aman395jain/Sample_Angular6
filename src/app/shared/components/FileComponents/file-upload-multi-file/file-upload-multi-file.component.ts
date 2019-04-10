import { Component, EventEmitter, OnInit, Inject, ViewChild} from '@angular/core';
import {MatTable, MAT_DIALOG_DATA} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {CommonConstants} from '@app/config/common-constants';

@Component({
  selector: 'app-file-upload-multi-file',
  templateUrl: './file-upload-multi-file.component.html',
  styleUrls: ['./file-upload-multi-file.component.css']
})
export class FileUploadMultiFileComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<any>;

  public allowed_extensions: Array<string> = CommonConstants.ALLOWED_FILE_TYPES_WORKFRONT;
  public fileTypeNotSupported = false;
  public fileList: File[] = new Array();
  public invalidFileList: any = [];

  public uploadEvent = new EventEmitter();
  public errorMsg = new EventEmitter();

  public displayedColumns: string[] = ['fileName', 'Size', 'deleteFile'];
  constructor(
    public orderConfigService: OrderConfigService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {

   if (this.orderConfigService.activeJob.multipleFiles !== undefined &&
      this.orderConfigService.activeJob.multipleFiles.length > 0) {
        this.fileList = this.orderConfigService.activeJob.multipleFiles;
        this.uploadEvent.emit(this.fileList);
      }
  }

  onInvalidFiles(invalidFileList: Array<File>) {
    this.errorMsg.emit(this.translate.instant('FILEUPLOAD.invalidFileType'));
  }

  fileSelected(file) {
    for (let i = 0; i < file.length; i++) {
      // Check if file is larger than 500mbs and valid file type
      if (file[i].size < CommonConstants.WORKFRONT_MAX_FILE_SIZE ) {
        const ext = file[i].name.split('.')[file[i].name.split('.').length - 1];
        if ( this.allowed_extensions.lastIndexOf(ext.toLowerCase()) !== -1) {
          this.fileList.push(file[i]);
        } else {
          this.errorMsg.emit(this.translate.instant('FILEUPLOAD.invalidFileType'));
        }
      } else {
        this.errorMsg.emit(this.translate.instant('FILEUPLOAD.fileTooLarge'));
      }

    }
    this.table.renderRows();
    this.uploadEvent.emit(this.fileList);
  }

  removeFile(id) {
    this.fileList.splice(id, 1);
    this.uploadEvent.emit(this.fileList);
    this.table.renderRows();
    this.fileList.length > 0 ? this.orderConfigService.proceedDisabled.next(false) : this.orderConfigService.proceedDisabled.next(true);
  }
}

