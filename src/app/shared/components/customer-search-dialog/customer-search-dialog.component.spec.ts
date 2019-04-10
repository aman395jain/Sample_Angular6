import { CustomerSearchDialogComponent } from './customer-search-dialog.component';
import { CustomerSearchService } from '@app/services';

describe('CustomerSearchDialogComponent', () => {
  let component: CustomerSearchDialogComponent;
  let customerSearchService: CustomerSearchService;

  beforeEach(() => {
    customerSearchService = new CustomerSearchService(null, null);
    component = new CustomerSearchDialogComponent(customerSearchService, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
