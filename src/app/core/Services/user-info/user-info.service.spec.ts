import { UserInfoService } from './user-info.service';

describe('UserInfoService', () => {
  let component: UserInfoService;

  beforeEach(() => {
    component = new UserInfoService(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
