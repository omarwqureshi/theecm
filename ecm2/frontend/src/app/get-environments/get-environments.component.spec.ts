import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetEnvironmentsComponent } from './get-environments.component';

describe('GetEnvironmentsComponent', () => {
  let component: GetEnvironmentsComponent;
  let fixture: ComponentFixture<GetEnvironmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetEnvironmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
