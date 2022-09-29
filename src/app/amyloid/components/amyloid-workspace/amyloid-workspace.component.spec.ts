import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmyloidWorkspaceComponent } from './amyloid-workspace.component';

describe('AmyloidWorkspaceComponent', () => {
  let component: AmyloidWorkspaceComponent;
  let fixture: ComponentFixture<AmyloidWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmyloidWorkspaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AmyloidWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
