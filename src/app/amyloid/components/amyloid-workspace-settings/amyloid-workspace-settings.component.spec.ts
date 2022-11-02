import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidWorkspaceSettingsComponent } from './amyloid-workspace-settings.component';

describe('AmyloidWorkspaceSettingsComponent', () => {
  let component: AmyloidWorkspaceSettingsComponent;
  let fixture: ComponentFixture<AmyloidWorkspaceSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmyloidWorkspaceSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmyloidWorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
