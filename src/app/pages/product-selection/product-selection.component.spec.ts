import { ProductSelectionComponent } from './product-selection.component';

describe('ProductSelectionComponent', () => {
  let component: ProductSelectionComponent;

  beforeEach(() => {
    component = new ProductSelectionComponent(null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
