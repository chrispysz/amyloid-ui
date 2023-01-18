import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceHolderService {
  workspace: Workspace | undefined;

  constructor() {}

  getWorkspace(): Workspace | undefined {
    return this.workspace;
  }

  setWorkspace(workspace: Workspace) {
    this.workspace = workspace;
  }
}
