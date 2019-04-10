import { ConfigurationScreenService } from './configuration-screen.service';

describe('ConfigurationScreenService', () => {
  let component: ConfigurationScreenService;

  beforeEach(() => {
    component = new ConfigurationScreenService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
