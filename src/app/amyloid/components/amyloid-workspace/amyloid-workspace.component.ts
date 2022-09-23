import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-amyloid-workspace',
  templateUrl: './amyloid-workspace.component.html',
  styleUrls: ['./amyloid-workspace.component.scss']
})
export class AmyloidWorkspaceComponent implements OnInit {
  workspaces: Workspace[] = [];

  constructor(private readonly workspaceService: WorkspaceService) {}

  ngOnInit(): void {}

  test(): void {
    this.workspaceService.getAll().subscribe((workspaces: Workspace[]) => {
      console.log(workspaces);
      this.workspaces = workspaces;
    });
  }

}
