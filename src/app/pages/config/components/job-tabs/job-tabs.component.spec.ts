import { JobTabsComponent } from './job-tabs.component';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('JobTabsComponent', () => {
  let component: JobTabsComponent;
  let translateService: TranslateService;

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
    component = new JobTabsComponent(null, null, null, null, null, translateService, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
