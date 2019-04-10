import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let component: CustomerService;

  beforeEach(() => {
    component = new CustomerService(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
