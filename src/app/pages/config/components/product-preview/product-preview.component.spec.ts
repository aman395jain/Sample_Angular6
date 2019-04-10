import { ProductPreviewComponent } from './product-preview.component';
import { OrderConfigService } from '@app/services';

describe('ProductPreviewComponent', () => {
  let component: ProductPreviewComponent;
  let orderConfigService: OrderConfigService;

  beforeEach(() => {
    orderConfigService = new OrderConfigService(null, null, null, null, null, null);
    component = new ProductPreviewComponent(null, orderConfigService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
