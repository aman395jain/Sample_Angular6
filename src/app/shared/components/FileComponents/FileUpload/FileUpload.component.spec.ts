import { FileUploadComponent } from './FileUpload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let data: any;

  beforeEach(() => {
    data = {};
    component = new FileUploadComponent(null, null, null, null, null, data, null, null, null, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
