import { WesmodalComponent } from './wesmodal.component';

describe('WesmodalComponent', () => {
  let component: WesmodalComponent;
  let data: any;

  beforeEach(() => {
    data = {};
    component = new WesmodalComponent(null, null, data, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
