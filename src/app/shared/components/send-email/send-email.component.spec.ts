import { SendEmailComponent } from './send-email.component';

describe('SendEmailComponent', () => {
  let component: SendEmailComponent;

  beforeEach(() => {
    component = new SendEmailComponent(null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
