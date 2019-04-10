import { EchCustomerService } from './EchCustomer.service';

describe('EchCustomerService', () => {
  let component: EchCustomerService;

  beforeEach(() => {
    component = new EchCustomerService(null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
