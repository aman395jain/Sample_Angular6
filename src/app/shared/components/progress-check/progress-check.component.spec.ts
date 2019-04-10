import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressCheckComponent } from './progress-check.component';

describe('ProgressCheckComponent', () => {
  let component: ProgressCheckComponent;
  let fixture: ComponentFixture<ProgressCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
