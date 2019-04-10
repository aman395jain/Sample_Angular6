import { OrderConfigService } from './order-config.service';

describe('OrderConfigService', () => {
  let component: OrderConfigService;

  beforeEach(() => {
    component = new OrderConfigService(null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
