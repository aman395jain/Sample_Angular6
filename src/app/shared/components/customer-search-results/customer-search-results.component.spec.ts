import { CustomerSearchResultsComponent } from './customer-search-results.component';

describe('CustomerSearchResultsComponent', () => {
  let component: CustomerSearchResultsComponent;

  beforeEach(() => {
    component = new CustomerSearchResultsComponent(null, null, null, null, null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
