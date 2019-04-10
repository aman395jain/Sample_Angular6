import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {first, map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {AuthService} from '@app/core/Services/auth/auth.service';
import {VersionCheckService} from '@app/core/Services/versioncheckservice/VersionCheckService';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public userNameList: any;
  filteredOptions: Observable<string[]>;
  public showLoader = false;
  public loggedIn = false;
  returnUrl: string;
  returnQueryParams = {};
  error = '';
  storeNumber: string;
  storeIdTimeout: any;
  storeNumberSet = false;
  public keycodes = [8, 9, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    private userInfoService: UserInfoService,
    public storeInfoService: StoreinfoService,
    private notificationService: NotificationService,
    private versionCheckService: VersionCheckService
  ) { }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  ngOnInit() {

    this.auth.showLoader.subscribe( value => {
      this.showLoader = value;
    });

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // reset login status
    this.auth.logout();

    if (this.storeInfoService.getStoreNumber()) {
      this.storeNumberSet = true;
      this.userInfoService.retrieveStoreUsers(this.storeInfoService.getStoreNumber()).subscribe(list => {
        this.userNameList = list;
        this.filteredOptions = this.loginForm.controls['username'].valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      });
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.versionCheckService.initVersionCheck();
  }

  login() {
    this.auth.showLoader.next(true);

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      this.auth.showLoader.next(false);
        return;
    }

    this.auth.loginSub = this.auth.login(this.f.username.value, this.f.password.value).pipe(first()).subscribe(result => {
      this.logger.debug(result);
      this.auth.authError.next('');
      this.auth.showLoader.next(false);
      this.loggedIn = true;

      this.userInfoService.retrieveUserInfo(sessionStorage
        .getItem('currentUserUserName').replace('"', '').replace('"', ''));
      this.auth.loggedIn.next(true);
      setTimeout(() => {
        this.router.navigateByUrl(this.returnUrl);
      }, 1000);
    }, error1 => {
      this.logger.error(error1);
      this.auth.showLoader.next(false);
      this.loggedIn = false;
    });

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.userNameList.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  storeNumberChange() {
    clearTimeout(this.storeIdTimeout);
    this.storeIdTimeout = setTimeout(() => {
      this.notificationService.showLoader();
      this.storeInfoService.setStoreNumber(+this.storeNumber);
      this.userInfoService.retrieveStoreUsers(+this.storeNumber).subscribe( list => {
        this.userNameList = list;
        this.filteredOptions = this.loginForm.controls['username'].valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        this.notificationService.hideLoader();
      }, err => {
        this.notificationService.hideLoader();
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    this.versionCheckService.cancelInterval();
  }

  restrictInput(event) {
      if (this.keycodes.includes(event.keyCode) && !event.shiftKey) {
          return(true);
      } else {
          return(false);
      }
  }
}