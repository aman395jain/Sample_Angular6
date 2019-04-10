import { FileUploadMultiFileComponent } from './file-upload-multi-file.component';

describe('FileUploadMultiFileComponent', () => {
  let component: FileUploadMultiFileComponent;

  beforeEach(() => {
    component = new FileUploadMultiFileComponent(null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
