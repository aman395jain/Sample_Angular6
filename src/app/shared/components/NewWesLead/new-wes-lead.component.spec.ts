import { NewWesLeadComponent } from './new-wes-lead.component';
import { ValidatorsService, OrderConfigService, WesleadsService } from '../../../services';
import { TranslateService, TranslateLoader, TranslateModule, TranslateFakeLoader } from '@ngx-translate/core';
import { TestBed, async } from '@angular/core/testing';

describe('NewWesLeadComponent', () => {
  let component: NewWesLeadComponent;
  let translateService: TranslateService;
  let validatorsService: ValidatorsService;
  let orderConfigService: OrderConfigService;
  let wesLeadsService: WesleadsService;
  let data: any;

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
    validatorsService = new ValidatorsService(null);
    orderConfigService = new OrderConfigService(null, null, null, null, null, null);
    wesLeadsService = new WesleadsService(null, null);
    component = new NewWesLeadComponent(null, null, translateService, validatorsService, data, wesLeadsService,
        null, orderConfigService, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
