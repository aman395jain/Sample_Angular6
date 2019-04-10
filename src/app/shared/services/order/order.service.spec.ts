import { OrderService } from './order.service';

describe('OrderService', () => {
  let component: OrderService;

  beforeEach(() => {
    component = new OrderService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
