import { SaveForLaterDialogComponent } from './save-for-later-dialog.component';

describe('SaveForLaterDialogComponent', () => {
  let component: SaveForLaterDialogComponent;
  let data: any;

  beforeEach(() => {
    data = {};
    component = new SaveForLaterDialogComponent(null, null, data);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
