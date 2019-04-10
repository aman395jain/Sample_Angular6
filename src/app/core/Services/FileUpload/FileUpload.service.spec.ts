import { FileUploadService } from './FileUpload.service';

describe('FileUploadService', () => {
  let component: FileUploadService;

  beforeEach(() => {
    component = new FileUploadService(null, null, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
