import {Component, NgZone, ChangeDetectorRef, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar, MatDialog, MatDialogRef} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { environment } from '@env/environment';
import {Keepalive} from '@ng-idle/keepalive';
import {DocumentInterruptSource, Idle, StorageInterruptSource} from '@ng-idle/core';
import {AuthService} from '@app/core/Services/auth/auth.service';
import {CommonConstants} from '@app/config/common-constants';
import {TimeOutDialogComponent} from '@app/shared/components/time-out-dialog/time-out-dialog.component';
import {StoreinfoService} from '@app/core/Services/storeinfo/storeinfo.service';
import {NotificationService} from '@app/core/Services/notification/notification.service';
import {BackgroundTaskStatusService} from '@app/core/Services/background-task-status/background-task-status.service';
import {LoggerService} from '@app/core/Services/logger-service/logger-service.service';
import {UserInfoService} from '@app/core/Services/user-info/user-info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger( 'slideInOut', [
      state( 'true', style( {
        transform: 'translate3d(0, 0, 0)'
      } ) ),
      state( 'false', style( {
        transform: 'translate3d(-100%, 0, 0)'
      } ) ),
      transition( 'in => out', animate( '400ms ease-in-out' ) ),
      transition( 'out => in', animate( '400ms ease-in-out' ) )
    ] )
  ]
})

export class AppComponent implements OnInit {

  loading = false;
  private loadingSub;
  private snackbarSub;
  idleState = 'Not started.';
  timeoutDialogOpen = false;
  lastPing?: Date = null;
  timeoutDialog: MatDialogRef<TimeOutDialogComponent>;

  constructor(
    public notificationService: NotificationService,
    translate: TranslateService,
    public storeInfoService: StoreinfoService,
    private userInfoService: UserInfoService,
    public snackBar: MatSnackBar,
    private zone: NgZone,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public statusService: BackgroundTaskStatusService,
    private changeDetectorRef: ChangeDetectorRef,
    private LOG: LoggerService,
    public router: Router,
    private idle: Idle,
    private keepalive: Keepalive,
    private auth: AuthService
  ) {
    if (environment.production) {
      this.setupFullStory();
    }
    this.snackbarSub = this.notificationService._notification$.subscribe( msg => {
      if ( msg ) {
        this.zone.run(() => {
          this.snackBar.open(msg.msg, null, {
            duration: msg.duration
          });
        });
      }
    });

    this.notificationService.showLoader();
    this.route.queryParams.subscribe(data => {
      if (document.location.pathname.split('?')[0] === '/' || (document.location.pathname.split('?')[0] === environment.rootURL + '/')
          || (document.location.pathname.split('?')[0] === environment.rootURL)) {
        const languageVal = (data.language != null) ? data.language : 'en_US';
        switch (languageVal) {
          case ('fr_CA'):
            storeInfoService.setLanguage({'name': 'French', 'value': 'fr_CA', 'icon': 'flag-ca'});
            break;
          case ('en_CA'):
            storeInfoService.setLanguage({'name': 'English', 'value': 'en_CA', 'icon': 'flag-ca'});
            break;
          default:
            storeInfoService.setLanguage({'name': 'English', 'value': 'en_US', 'icon': 'flag-us'});
        }
        const language = storeInfoService.getLanguageValue();
        translate.setDefaultLang(language);
        translate.use(language);

        // this.LOG.info(storeInfoService.getLanguageValue());

        const storeId = data.StoreID || data.storeId || data.StoreId;
        if (storeId) {
          storeInfoService.setStoreNumber(storeId);
          dialog.closeAll();
        }if (data.StoreId) {
          storeInfoService.setStoreNumber(data.StoreId);
          dialog.closeAll();
        } else {
          storeInfoService.checkForStoreNum();
        }
      } else {
        const language = (storeInfoService.getLanguageValue() != null) ? storeInfoService.getLanguageValue() : 'en_US';
        translate.setDefaultLang(language);
        translate.use(language);
        storeInfoService.checkForStoreNum();
      }
      this.notificationService.hideLoader();
    });

    // used to detect if background tasks are still running and ask the associate if they want to continue
    window.onbeforeunload = function(event) {
      if (statusService.checkIfTaskRunning()) {
        event.returnValue = true;
      }
    };

    /**
     * setup idle and timeout monitoring
     */

    this.setupIdleTimeout();
    if (sessionStorage.getItem('currentUser')) {
      this.idle.watch();
      this.keepalive.start();

      if (!this.keepalive.isRunning()) {
        this.keepalive.start();
      }
    } else {
      this.auth.loggedIn.subscribe( loggedIn => {
        if (loggedIn) {
          this.idle.watch();
          if (!this.keepalive.isRunning()) {
            this.keepalive.start();
          }
        } else {
          this.idle.stop();
        }
      });

    }
  }

  setupIdleTimeout() {
    /****
     * Code to setup user time out
     */
    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(CommonConstants.IDLE_TIME);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(CommonConstants.TIMEOUT);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts([new DocumentInterruptSource('keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll', null),
      new StorageInterruptSource()]);

    this.idle.onTimeout.subscribe(() => {
      this.LOG.debug('in onTimeout');
      this.auth.logout();
      this.timeoutDialogOpen = false;
      this.router.navigate(['/login']);
    });
    this.idle.onIdleEnd.subscribe(() => {
      this.timeoutDialogOpen = false;
      this.LOG.debug('in onIdleEnd');
    });

    this.idle.onIdleStart.subscribe(() => {
      this.LOG.debug('onIdleStart');
      if ( !this.timeoutDialogOpen ) {
        this.timeoutDialogOpen = true;
        this.timeoutDialog = this.dialog.open(TimeOutDialogComponent, {
          width: '300px',
          height: 'auto',
          disableClose: false,
          data: {}
        });
      }
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(CommonConstants.KEEPALIVE_INTERVAL);

    this.keepalive.onPing.subscribe(() => {
      this.lastPing = new Date();
    });
  }


    setupFullStory() {
        window['_fs_debug'] = false;
        window['_fs_host'] = 'fullstory.com';
        window['_fs_org'] = '5XBPE';
        window['_fs_namespace'] = 'FS';

        (function(m,n,e,t,l,o,g,y) {
            if (e in m && m.console && m.console.log) {
                m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');
                return;
            }
            g = m[e] = function(a,b) { g.q ? g.q.push([a,b]) : g._api(a,b); };
            g.q = [];
            o = n.createElement(t);
            o.async = 1;
            o.src = 'https://fullstory.com/s/fs.js';
            y = n.getElementsByTagName(t)[0];
            y.parentNode.insertBefore(o,y);
            g.identify = function(i,v) {
                g(l,{uid:i});
                if (v)
                    g(l,v)
            };
            g.setUserVars = function(v) {
                g(l,v)
            };
            g.identifyAccount = function(i,v) {
                o = 'account';
                v = v || {};
                v.acctId = i;
                g(o,v)
            };
            g.clearUserCookie = function(c,d,i) {
                if(!c || document.cookie.match('fs_uid=[`;`]*`[`;`]*`[`;`]*`')) {
                    d = n.domain;
                    while (1) {
                        n.cookie = 'fs_uid=;domain=' + d + ';path=/;expires=' + new Date(0).toUTCString();
                        i = d.indexOf('.');
                        if (i < 0)
                            break;
                        d = d.slice(i+1)
                    }
                }
            };
        })
        (window,document,window['_fs_namespace'],'script','user');
    }

  ngOnInit() {
    this.loadingSub = this.notificationService._loading$.subscribe( change => {
      this.loading = change;
      this.changeDetectorRef.detectChanges();
    });

    if (sessionStorage.getItem('currentUserUserName')) {
      this.userInfoService.retrieveUserInfo(
        sessionStorage.getItem('currentUserUserName').replace(new RegExp('"', 'g'), ''));
    }
  }

  showNavBar() {
    if (this.router.url.toLocaleLowerCase().includes('/print/') || this.router.url.toLocaleLowerCase().includes('/login')) {
      return false;
    }
    return true;
  }
}
