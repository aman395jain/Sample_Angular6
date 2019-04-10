import { FilePreviewComponent } from './FilePreview.component';

describe('FilePreviewComponent', () => {
  let component: FilePreviewComponent;

  beforeEach(() => {
    component = new FilePreviewComponent(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
