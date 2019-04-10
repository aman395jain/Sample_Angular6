import { CustomerSearchComponent } from './customer-search.component';
import { ValidatorsService } from '@app/services';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('CustomerSearchComponent', () => {
  let component: CustomerSearchComponent;
  let translateService: TranslateService;
  let validatorsService: ValidatorsService;

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
    validatorsService = new ValidatorsService(null);
    component = new CustomerSearchComponent(translateService, validatorsService, null, null, null, null,
      null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
