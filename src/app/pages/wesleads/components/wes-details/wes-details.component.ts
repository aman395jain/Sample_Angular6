import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {FileUploadComponent} from '@app/shared/components/FileComponents';
import {SnackNotification} from '@app/models/SnackNotification';
import {WesleadsService} from '@app/shared/services/wesleads/wesleads.service';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';

@Component({
  selector: 'app-wes-details',
  templateUrl: './wes-details.component.html',
  styleUrls: ['./wes-details.component.css']
})
export class WesDetailsComponent implements OnInit {

  wesData: any;
  leadData: any;
  errorMsg: string;
  noDataErrorMsg: string;
  clientSideErrorMsg: string;
  serverSideErrorMsg: string;
  wesLeadSuccessMsg: string;
  wesPricingIssueEnabled = false;

  constructor(
          private translate: TranslateService,
          public wesLeadsService: WesleadsService,
          public sharedDataService: SharedDataService,
          public dialog: MatDialog,
          public storeInfoService: StoreinfoService,
          vcr: ViewContainerRef,
          private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.wesPricingIssueEnabled = this.storeInfoService.isStoreFeature('wesPricingIssue');
    this.translate.get('COMMON.error').subscribe(
        data => {
            this.errorMsg = data.wesLead;
            this.clientSideErrorMsg = data.clientSide;
            this.serverSideErrorMsg = data.serverSide;
            this.noDataErrorMsg = data.wesLeadNoData;
        }
    );

    this.translate.get('WES').subscribe(
        data => {
            this.wesLeadSuccessMsg = data.updateSuccess;
        }
    );

    this.sharedDataService.currentWesLead.subscribe(
            selectedWesLead => {
                this.wesData = selectedWesLead.wesData;
                this.sharedDataService.wesComment.opportunityId = selectedWesLead.opportunityId;
                this.leadData = selectedWesLead.leadData;
            }
    );
    this.sharedDataService.resetCommentData();
  }

  fileUpload() {
      const dialogRef = this.dialog.open(FileUploadComponent, {
          width: '900px',
          height: 'auto',
          data: { isWesUpload: true }
        });
  }

  onSubmit() {
      // this.wesComment.opportunityId = this.wesData.peid__C;
      this.notificationService.showLoader();
      // Append uploaded file link to comments section
      if (this.sharedDataService.wesFileLink !== '') {
          this.sharedDataService.wesComment.comments += ' | File Uploaded: ' + this.sharedDataService.wesFileLink;
      }
      this.wesLeadsService.updateWesLead(this.sharedDataService.wesComment).subscribe(
              data => {
                  if (data === 'opportunity updated') {

                      this.notificationService.notify(new SnackNotification(this.wesLeadSuccessMsg, null));

                      this.wesLeadsService.retrieveWesLead(this.sharedDataService.wesComment.opportunityId).subscribe(
                              data => {
                                  if (data == null) {
                                      this.notificationService.hideLoader();
                                      throw new Error(this.noDataErrorMsg);
                                  }
                                  this.wesData = data;
                                  this.notificationService.hideLoader();
                                  this.sharedDataService.resetCommentData();
                              },
                              err => {
                                  this.notificationService.hideLoader();
                                  if (err.error instanceof Error) {
                                      throw new Error(this.clientSideErrorMsg);
                                  } else {
                                      throw new Error(this.serverSideErrorMsg);
                                  }
                              }
                      );

                  } else {
                      this.notificationService.hideLoader();
                      this.sharedDataService.resetCommentData();
                      throw new Error(this.errorMsg);
                  }
              },
              err => {
                  this.notificationService.hideLoader();
                  this.sharedDataService.resetCommentData();
                  throw new Error(this.errorMsg);
              }
      );
  }
}
