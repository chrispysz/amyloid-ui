import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidPredictionProgressComponent } from './amyloid-prediction-progress.component';

describe('AmyloidPredictionProgressComponent', () => {
  let component: AmyloidPredictionProgressComponent;
  let fixture: ComponentFixture<AmyloidPredictionProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidPredictionProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidPredictionProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
