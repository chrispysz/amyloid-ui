import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidDetailedResultsComponent } from './amyloid-detailed-results.component';

describe('AmyloidDetailedResultsComponent', () => {
  let component: AmyloidDetailedResultsComponent;
  let fixture: ComponentFixture<AmyloidDetailedResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidDetailedResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidDetailedResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
