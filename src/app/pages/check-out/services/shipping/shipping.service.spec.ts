import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  let component: ShippingService;

  beforeEach(() => {
    component = new ShippingService(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
