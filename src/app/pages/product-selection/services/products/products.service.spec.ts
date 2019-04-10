import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let component: ProductsService;

  beforeEach(() => {
    component = new ProductsService(null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
