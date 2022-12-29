import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { Workspace } from '../../models/workspace';

@Component({
  selector: 'app-amyloid-workspace-settings',
  templateUrl: './amyloid-workspace-settings.component.html',
  styleUrls: ['./amyloid-workspace-settings.component.scss'],
})
export class AmyloidWorkspaceSettingsComponent implements OnInit {
  workspace!: Workspace;
  isLoading: boolean = true;

  workspaceSettingsForm = new FormGroup({
    workspaceName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
    ]),
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   let workspaceId = params['id'];
    //   this.workspaceService.getWorkspace(workspaceId).then((workspace) => {
    //     this.workspace = workspace;
    //     this.isLoading = false;
    //     this.workspaceSettingsForm.controls['workspaceName'].setValue(
    //       this.workspace.name
    //     );
    //   });
    // });
  }

  saveSettings(fields: any): void {
    this.workspace.name = fields.workspaceName;
 //   this.workspaceService.updateWorkspace(this.workspace);
  }

  deleteWorkspace(): void {
    if (
      confirm(
        `Are you sure you want to delete ${this.workspace.name}? This action cannot be undone.`
      )
    ) {
    //  this.workspaceService.deleteWorkspace(this.workspace);
      this.router.navigate(['/amyloid/workspaces']);
    }
  }
}
