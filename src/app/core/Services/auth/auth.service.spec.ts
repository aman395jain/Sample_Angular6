import { AuthService } from './auth.service';

describe('AuthService', () => {
  let component: AuthService;

  beforeEach(() => {
    component = new AuthService(null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
