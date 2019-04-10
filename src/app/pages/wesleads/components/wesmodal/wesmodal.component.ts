import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {WesLeadComment} from '@app/models/wes-lead-comment';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {WesleadsService} from '@app/shared/services/wesleads/wesleads.service';

@Component({
  selector: 'app-wesmodal',
  templateUrl: './wesmodal.component.html',
  styleUrls: ['./wesmodal.component.css']
})
export class WesmodalComponent {
  wesData: any;
  wesComment: WesLeadComment = new WesLeadComment(null, null, null);
  leadData: any;

  constructor(
     public dialogRef: MatDialogRef<WesmodalComponent>,
     private translate: TranslateService,
     @Inject(MAT_DIALOG_DATA) public data: any,
     private wesleadService: WesleadsService,
     vcr: ViewContainerRef,
     private notificationService: NotificationService

  ) {
    console.log(data);
    this.wesData = data.data;
    this.wesComment.opportunityId = data.leadId;
    this.leadData = data.leadData;
  }

   onNoClick(): void {
    this.dialogRef.close();

  }

   onSubmit(){
       //this.wesComment.opportunityId = this.wesData.peid__C;
       this.notificationService.showLoader();
       this.wesleadService.updateWesLead(this.wesComment).subscribe(
               data => {
                   if(data === "opportunity updated"){
                       //  this.dialogRef.close();
                       //this.toastr.success("Wes Lead Updated Successfully", null,null);
                       this.wesleadService.retrieveWesLead(this.wesComment.opportunityId).subscribe(
                               data => {
                                   if (data == null) {
                                       this.notificationService.hideLoader();
                                       const msg =  'Unable to show WES Lead Data.';
                                       throw new Error(msg);
                                   }
                                   this.wesData = data;
                                   this.notificationService.hideLoader();
                                   this.wesComment.comments = '';
                               },
                               err => {
                                   this.notificationService.hideLoader();
                                   if (err.error instanceof Error) {
                                       const msg = 'Client-side error occured.';
                                       throw new Error(msg);
                                   } else {
                                       const msg =  'Server-side error occured.';
                                       throw new Error(msg);
                                   }
                               }
                       );

                   }else{
                       this.notificationService.hideLoader();
                       throw new Error("Wes Lead failed to update. Please try again");
                   }
               },
               err => {
                   this.notificationService.hideLoader();
                   throw new Error("Wes Lead failed to update. Please try again");
               }
       );

   }

}
