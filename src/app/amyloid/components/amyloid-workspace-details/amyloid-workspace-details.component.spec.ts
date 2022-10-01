import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidWorkspaceDetailsComponent } from './amyloid-workspace-details.component';

describe('AmyloidWorkspaceDetailsComponent', () => {
  let component: AmyloidWorkspaceDetailsComponent;
  let fixture: ComponentFixture<AmyloidWorkspaceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidWorkspaceDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidWorkspaceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
