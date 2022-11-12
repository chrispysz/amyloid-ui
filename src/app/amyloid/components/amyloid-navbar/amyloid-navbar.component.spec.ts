import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidNavbarComponent } from './amyloid-navbar.component';

describe('AmyloidNavbarComponent', () => {
  let component: AmyloidNavbarComponent;
  let fixture: ComponentFixture<AmyloidNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidNavbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
