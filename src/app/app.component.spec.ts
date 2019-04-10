import { AppComponent } from './app.component';
import { NotificationService, BackgroundTaskStatusService } from '@app/services';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let notificationService: NotificationService;
  let route: ActivatedRoute;
  let statusService: BackgroundTaskStatusService;
  let translateService: TranslateService;

  // let mockCustomerSearchService;
  // let mockStoreInfoService;
  // let mockUserInfoService;
  // let mockSnackBar;
  // let mockZone;
  // let mockDialog;
  // let mockChangeDetectorRef;
  // let mockLog;
  // let mockRouter;
  // let mockIdle;
  // let mockKeepAlive;
  // let mockAuth;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
      })],
      providers: [TranslateService]
    }).compileComponents();
    translateService = TestBed.get(TranslateService);
  }));

  beforeEach(() => {
    notificationService = new NotificationService();
    route = new ActivatedRoute();
    statusService = new BackgroundTaskStatusService();

    // mockCustomerSearchService = jasmine.createSpyObj(['']);
    // mockStoreInfoService = jasmine.createSpyObj(['']);
    // mockUserInfoService = jasmine.createSpyObj(['']);
    // mockSnackBar = jasmine.createSpyObj(['']);
    // mockZone = jasmine.createSpyObj(['']);
    // mockDialog = jasmine.createSpyObj(['']);
    // mockChangeDetectorRef = jasmine.createSpyObj(['']);
    // mockLog = jasmine.createSpyObj(['']);
    // mockRouter = jasmine.createSpyObj(['']);
    // mockIdle = jasmine.createSpyObj(['']);
    // mockKeepAlive = jasmine.createSpyObj(['']);
    // mockAuth = jasmine.createSpyObj(['']);

    // component = new AppComponent(notificationService, mockCustomerSearchService, translateService, mockStoreInfoService,
    //   mockUserInfoService, mockSnackBar, mockZone, route, mockDialog, statusService, mockChangeDetectorRef, mockLog,
    //   mockRouter, mockIdle, mockKeepAlive, mockAuth);

    component = new AppComponent(notificationService, null, translateService, null,
      null, null, null, route, null, statusService, null, null,
      null, null, null, null);
  });

  xit('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
