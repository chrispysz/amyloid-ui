import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidModelCardComponent } from './amyloid-model-card.component';

describe('AmyloidModelCardComponent', () => {
  let component: AmyloidModelCardComponent;
  let fixture: ComponentFixture<AmyloidModelCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidModelCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidModelCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
