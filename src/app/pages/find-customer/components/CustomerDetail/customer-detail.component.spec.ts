import { CustomerDetailComponent } from './customer-detail.component';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
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
    component = new CustomerDetailComponent(translateService, null, null, null, null, null,
        null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
