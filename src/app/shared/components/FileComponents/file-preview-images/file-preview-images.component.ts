import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, NgxGalleryImageSize} from 'ngx-gallery';
import {Subscription} from 'rxjs';
import {PrintBrokerResponse} from '@app/models/printbroker/PrintBrokerResponse';
import {environment} from '@env/environment';
import {FileUploadService} from '@app/core/Services/FileUpload/FileUpload.service';


@Component({
  selector: 'app-file-preview-images',
  templateUrl: './file-preview-images.component.html',
  styleUrls: ['./file-preview-images.component.css']
})
export class FilePreviewImagesComponent implements OnInit, OnDestroy {

  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];
  public hidePreviewComponent = true;
  private getXmlSub: Subscription;
  public noPreviewError: boolean;

  @Input() configScreen;

  constructor(
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit() {
    let viewHeight = '45vh';
    if (this.configScreen) {
       viewHeight = '80vh';
    }
    this.galleryOptions = [
      {
        width: '100%',
        height: viewHeight,
        imageSize: NgxGalleryImageSize.Contain,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
        imageBullets: true,
        thumbnails: false,
        imageDescription: false
      }
    ];
  }

  @Input()
  set files(printBrokerFiles: PrintBrokerResponse) {
    if (!!printBrokerFiles && printBrokerFiles.fileDescriptions.length > 1) {
      this.noPreviewError = false;
      // check to see if its cloud or local Print Broker
      if (!this.fileUploadService.useCloudPB() && !printBrokerFiles.fileDescriptions[0].fileUrl.includes('assets')) {
        // Local print broker has a bug where it only returns the first page in the json for low res or thumbnail images.
        // we need to process xml file to get number of pages and then get the images manually
        this.getXmlSub = this.fileUploadService.getXMLFile(printBrokerFiles.fileDescriptions[2].fileUrl).subscribe( xmlReport => {
          const fileInterogationResults = this.fileUploadService.processXMLFile(xmlReport);
          this.galleryImages = [];
          for (let i = 0; i < fileInterogationResults.impressions; i++ ) {
            let imgUrl = printBrokerFiles.fileDescriptions[4].fileUrl;
            if ( i > 0) {
              const pgcnt = i + 1;
              imgUrl =  printBrokerFiles.fileDescriptions[4].fileUrl.replace('.jpg' , pgcnt + '.jpg' );
            }
            // if running locally with local pb switch https to http
            if (!environment.production) {
              imgUrl = imgUrl.replace('https', 'http');
            }
            const img = new NgxGalleryImage({'small': imgUrl, 'medium': imgUrl, 'big': imgUrl} );
            this.galleryImages.push(img);
          }
          this.hidePreviewComponent = false;
        });

      } else {
        this.galleryImages = [];
        for (let i = 0; i < printBrokerFiles.thumbnails.length; i++ ) {
          const img = new NgxGalleryImage({'small': printBrokerFiles.thumbnails[i].fileUrl,
            'medium': printBrokerFiles.fileDescriptions[i + 4].fileUrl,
            'big': printBrokerFiles.fileDescriptions[i + 4].fileUrl} );
          this.galleryImages.push(img);
        }
        this.hidePreviewComponent = false;
      }
    } else {
      this.noPreviewError = true;
    }
  }

  ngOnDestroy (): void {
    if (this.getXmlSub) {
      this.getXmlSub.unsubscribe();
    }
  }

}
