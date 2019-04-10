import { LostQuoteComponent } from './lost-quote.component';
import { StoreinfoService } from '@app/services';

describe('LostQuoteComponent', () => {
  let component: LostQuoteComponent;
  let storeInfoService: StoreinfoService;
  let data: any;

  beforeEach(() => {
    storeInfoService = jasmine.createSpyObj(['getStoreNumber']);
    data = { quote: [] };
    component = new LostQuoteComponent(null, null, null, null, null, null, storeInfoService, data);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
