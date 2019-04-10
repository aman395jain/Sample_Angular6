import { CustomerSearchService } from './customer-search.service';

describe('CustomerSearchService', () => {
  let component: CustomerSearchService;

  beforeEach(() => {
    component = new CustomerSearchService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
