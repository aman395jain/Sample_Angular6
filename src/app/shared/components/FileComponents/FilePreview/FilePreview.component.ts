import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {environment} from '@env/environment';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';

@Component({
  selector: 'app-FilePreview',
  templateUrl: './FilePreview.component.html',
  styleUrls: ['./FilePreview.component.css']
})
export class FilePreviewComponent implements OnInit, OnDestroy {

  public page = 1;
  public totalPages: number;
  public isLoaded = false;
  public fileLoaded = false;
  public pdfjsLoc = environment.rootURL + '/assets/pdfjs';
  public _pdfSrc = environment.rootURL + '/assets/pdf-test2.pdf';
  public showInvalidFileFormatWarning = false;
  private downloadSub: Subscription;

  @ViewChild('pdfViewer') pdfViewer;

  constructor(
    private fileUploadService: FileUploadService,
    private logger: LoggerService
  ) {
   }

  ngOnInit() {
  }

  ngOnDestroy() {
    try {
      if ( this.downloadSub) {
        this.downloadSub.unsubscribe();
      }
    } catch (error) {
      this.logger.error('error unsubscribing from download file: ' + error);
    }
  }

  refreshPdf() {
    this.downloadSub = this.fileUploadService.downloadFile(this.pdfSrc).subscribe(
      (res) => {
        this.pdfViewer.pdfSrc = res; // pdfSrc can be Blob or Unit8Array
        this.pdfViewer.refresh(); // Ask pdf viewer to load/refresh pdf
      });
  }

  @Input()
  set pdfSrc(pdfSrc: string) {
    if (pdfSrc === null || pdfSrc === '' ) { return; }
    if (pdfSrc.endsWith('.pdf') || pdfSrc.includes('/api/orders/print')) {
      this._pdfSrc = pdfSrc;
      let pdfUrl = pdfSrc;
      if (!environment.production) {
        pdfUrl = pdfUrl.replace('https', 'http');
      }
      this.downloadSub = this.fileUploadService.downloadFile(pdfUrl).subscribe(
        (res) => {
          this.isLoaded = true;
          this.fileLoaded = true;
          this.pdfViewer.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
          this.pdfViewer.refresh(); // Ask pdf viewer to load/reresh pdf
        });
    } else {
      this.showInvalidFileFormatWarning = true;
      this.fileLoaded = true;
    }
  }
}
