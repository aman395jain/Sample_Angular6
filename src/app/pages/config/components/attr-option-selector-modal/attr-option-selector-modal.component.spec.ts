import { AttrOptionSelectorModalComponent } from './attr-option-selector-modal.component';

describe('AttrOptionSelectorModalComponent', () => {
  let component: AttrOptionSelectorModalComponent;
  let data: any;

  beforeEach(() => {
    data = { groupVO: [] };
    component = new AttrOptionSelectorModalComponent(null, data, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
