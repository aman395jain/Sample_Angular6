import { ConfigoptionsComponent } from './configoptions.component';

describe('ConfigoptionsComponent', () => {
  let component: ConfigoptionsComponent;

  beforeEach(() => {
    component = new ConfigoptionsComponent(null, null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set showSideBar to true', () => {
    component.showSideBar = false;

    component.openOptionsNav();

    expect(component.showSideBar).toBe(true);
  });
});
