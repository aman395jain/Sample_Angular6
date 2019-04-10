import { OrderConfirmationDialogComponent } from './OrderConfirmationDialog.component';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('OrderConfirmationDialogComponent', () => {
  let component: OrderConfirmationDialogComponent;
  let data: any;
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
    data = {};
    component = new OrderConfirmationDialogComponent(translateService, null, null, null, null, null, null, null, data);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
