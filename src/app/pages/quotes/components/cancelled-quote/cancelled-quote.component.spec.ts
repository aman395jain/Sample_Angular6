import { CancelledQuoteComponent } from './cancelled-quote.component';
import { StoreinfoService } from '@app/services';

describe('CancelledQuoteComponent', () => {
  let component: CancelledQuoteComponent;
  let storeInfoService: StoreinfoService;
  let data: any;

  beforeEach(() => {
    storeInfoService = jasmine.createSpyObj(['getStoreNumber']);
    data = { quote: [] };
    component = new CancelledQuoteComponent(null, null, null, null, null, null, storeInfoService, data);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
