import { OrderSummaryComponent } from './order-summary.component';

describe('OrderSummaryComponent', () => {
  let component: OrderSummaryComponent;

  beforeEach(() => {
    component = new OrderSummaryComponent(null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
