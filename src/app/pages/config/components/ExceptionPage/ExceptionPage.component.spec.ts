import { ExceptionPageComponent } from './ExceptionPage.component';
import { FormBuilder } from '@angular/forms';

describe('ExceptionPageComponent', () => {
  let component: ExceptionPageComponent;
  let fb: FormBuilder;
  let data: any;

  beforeEach(() => {
    fb = new FormBuilder();
    data = {};
    component = new ExceptionPageComponent(null, null, null, null, null, fb, null, data, null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
