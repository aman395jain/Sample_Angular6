import { VersionCheckService } from './VersionCheckService';

describe('VersionCheckService', () => {
  let component: VersionCheckService;

  beforeEach(() => {
    component = new VersionCheckService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
