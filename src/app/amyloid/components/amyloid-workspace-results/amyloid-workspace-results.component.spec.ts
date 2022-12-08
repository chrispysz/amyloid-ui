import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidWorkspaceResultsComponent } from './amyloid-workspace-results.component';

describe('AmyloidWorkspaceResultsComponent', () => {
  let component: AmyloidWorkspaceResultsComponent;
  let fixture: ComponentFixture<AmyloidWorkspaceResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidWorkspaceResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidWorkspaceResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
