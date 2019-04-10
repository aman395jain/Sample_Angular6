import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef } from '@angular/material';
import {StoreinfoService} from '../../../core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '../../../core/Services/notification/notification.service';
import {SnackNotification} from '../../../models/SnackNotification';
import {UserInfoService} from '../../../core/Services/user-info/user-info.service';
import {UserMessage} from '../../../models/UserMessage';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent implements OnInit {

  public userMessage;
  public sent = false;

  constructor(
          public dialogRef: MatDialogRef<SendEmailComponent>,
          private translate: TranslateService,
          private notificationService: NotificationService,
          public storeInfoService: StoreinfoService,
          public userInfoService: UserInfoService
  ) {
  }

  ngOnInit() {
  }

  onSubmit() {
    // Call the back-end code to send the email
    this.sent = true;

    this.storeInfoService.contactSBTeam(new UserMessage(this.userInfoService.user.name + ':  ID ' + this.userInfoService.user.loginId,
    this.userMessage)).subscribe(
        ( data )  => {
          this.notificationService.notify(new SnackNotification('Feedback submitted successfully!', 3000));
        },
        ( error ) => {
          this.notificationService.notify(new SnackNotification('Failed to submit feedback ' + error, 3000));
        }
      );
  }

  onNoClick(): void {
    this.dialogRef.close({status: 'cancel'});
  }
}
