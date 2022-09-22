import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidDashboardComponent } from './amyloid-dashboard.component';

describe('AmyloidDashboardComponent', () => {
  let component: AmyloidDashboardComponent;
  let fixture: ComponentFixture<AmyloidDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
