import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import {NewWesLeadComponent} from '@app/shared/components/NewWesLead/new-wes-lead.component';
import {AuthService} from '@app/core/Services/auth/auth.service';
import {SendEmailComponent} from '@app/shared/components/send-email/send-email.component';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {OrderConfigService} from '@app/core/Services/order-config/order-config.service';
import {TranslateService} from '@ngx-translate/core';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';
import {WesLeadData} from '@app/models/wes-lead-data';
import {environment} from '@env/environment';
import {SharedDataService} from '@app/core/Services/shared-data/shared-data.service';


@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {
   display = 'none';
   superUser;
   backendAppInfo;
   releaseNotes;
   uiBuildVersion: String;
   uiBuildDate: String;
   couponLinkSuppressed = false;
   couponLookupURL: string;
   wesPricingIssueEnabled = false;

  constructor(
    public dialog: MatDialog,
    public storeInfoService: StoreinfoService,
    public translate: TranslateService,
    public orderConfigService: OrderConfigService,
    private auth: AuthService,
    public router: Router,
    public userService: UserInfoService,
    public sharedDataService: SharedDataService
  ) { }

  ngOnInit() {
    this.wesPricingIssueEnabled = this.storeInfoService.isStoreFeature('wesPricingIssue');
    
    this.couponLinkSuppressed = this.storeInfoService.isStoreFeature('suppressCouponLink');
    if (!this.couponLinkSuppressed) {
      this.couponLookupURL = this.storeInfoService.getStoreFeatureValue('couponLookupURL');
    }

    this.userService.releaseNotes().subscribe(
      (data : any) => {
        if (data.status == 'OK') {
          this.releaseNotes = data.fileJList;
        }
      });
    
    this.backendAppInfo = this.userService.getBackendAppInfo();
    if (environment.production) {
      this.uiBuildVersion = '{{POST_BUILD_ENTERS_UI_BUILD_VERSION_HERE}}';
      this.uiBuildDate = '{{POST_BUILD_ENTERS_UI_BUILD_DATE_HERE}}';
    } else {
      this.uiBuildVersion = 'No version in development mode';
      this.uiBuildDate = 'Thu Oct 25 2018 11:40:15 GMT-0400 (Eastern Daylight Time)';
    }
  }

  setLanguage(selected) {
    this.storeInfoService.setLanguage(selected);
    this.translate.use(selected.value);
  }

  showInfo(msg) {
  }

  toggleFullStorySessionId(): void {
      this.showInfo('Full Story not enabled for your store');
  }

  WikiFunction() {
      window.open('http://connections.staples.com/wikis/home?lang=en_US#/wiki' +
      '/Wabde55cc6331_48ee_9e81_4491bef7ea0a/page/Order%20Intake%20(Solution%20Builder)',
      'target= "_blank"', 'toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=200, width=700, height=500');
  }

  couponFunction() {
    window.open(this.couponLookupURL, 'target= "_blank"',
      'toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=200, width=700, height=500');
  }

  releaseNotesFunction(fileRef) {
    window.open(environment.rootApiUrl + '/file/download/' + fileRef, 'target= "_blank"',
      'toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=200, width=700, height=500');
  }

  logout() {
      this.display = 'block';
      this.auth.logout();
      this.router.navigate(['/login']);
  }

  openSendEmailDialog(): void {
      const dialogRef = this.dialog.open(SendEmailComponent, {
          width: '475px',
          height: 'auto'
      });
  }

  openNewWesLeadDialog(leadType: boolean): void {

    const dialogRef = this.dialog.open(NewWesLeadComponent, {
      width: '800px',
      height: 'auto',
      data: { name: null, leadType: leadType }
    });

    dialogRef.afterClosed().subscribe(result => {

      if ( result.status === 'success') {
      } else if (result.status === 'cancel') {
        this.sharedDataService.newWesLeadInfo = new WesLeadData();
      } else {
        throw new Error(result.msg);
      }

    });
  }
}
