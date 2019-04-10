import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let component: NotificationService;

  beforeEach(() => {
    component = new NotificationService();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
