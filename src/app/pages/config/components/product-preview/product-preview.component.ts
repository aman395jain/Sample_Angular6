import { Component, OnInit, OnDestroy } from '@angular/core';
import {CommonConstants} from '@app/config/common-constants';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {environment} from '@env/environment';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';

@Component({
  selector: 'app-product-preview',
  templateUrl: './product-preview.component.html',
  styleUrls: ['./product-preview.component.css']
})
export class ProductPreviewComponent implements OnInit, OnDestroy {

  public showSideBar = true;
  public showSideBarSub: any;
  page = 1;
  totalPages: number;
  public showSampleFileWarning = false;
  public pbResults;

  constructor(
          public orderConfigService: OrderConfigService,
          public sharedDataService: SharedDataService
  ) {
    this.orderConfigService.pdfSrc = environment.rootURL + '/assets/pdf-test2.pdf';
  }

  ngOnInit() {
      // subscribe to menu size changes to resize canvas
      this.showSideBarSub = this.sharedDataService.notifyMenuChangeObservable$.subscribe((res) => {
          this.showSideBar = res;
      });

      // subscribe to changes in the file uploaded (if file uploaded from vertical footer)
      this.orderConfigService.fileUploadedSub.subscribe(
        data => {
          if ( !!this.orderConfigService.activeJob.printBrokerFiles &&
            this.orderConfigService.activeJob.printBrokerFiles.fileDescriptions.length > 1) {
            this.pbResults = this.orderConfigService.activeJob.printBrokerFiles;
            this.showSampleFileWarning = false;
          } else {
            this.showSampleFileWarning = true;
            this.pbResults = CommonConstants.SAMPLE_FILES;
          }

        }
      );
  }

  showProductPreview() {
    this.showSideBar = !this.showSideBar;
    this.sharedDataService.notifyMenuChange(this.showSideBar);
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.sharedDataService.configPageIsLoaded = true;
  }

  ngOnDestroy(): void {
      this.showSideBarSub.unsubscribe();
  }

  nextPage() {
    this.page++;
  }

  prevPage() {
    this.page--;
  }

}
