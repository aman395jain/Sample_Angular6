import { AddressValidationService } from './address-validation.service';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('AddressValidationService', () => {
  let component: AddressValidationService;
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
    component = new AddressValidationService(null, translateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
