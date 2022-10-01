import { TestBed } from '@angular/core/testing';

import { WorkspaceResolver } from './workspace.resolver';

describe('WorkspaceResolver', () => {
  let resolver: WorkspaceResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(WorkspaceResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
