import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-amyloid-workspace-settings',
  templateUrl: './amyloid-workspace-settings.component.html',
  styleUrls: ['./amyloid-workspace-settings.component.scss'],
})
export class AmyloidWorkspaceSettingsComponent implements OnInit {
  workspace!: Workspace;

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
    private readonly workspaceService: WorkspaceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace']))
      .subscribe((result) => {
        this.workspace = result;
        this.workspaceSettingsForm.controls['workspaceName'].setValue(
          this.workspace.name
        );
      });
  }

  saveSettings(fields: any): void {
    this.workspace.name = fields.workspaceName;
    this.workspaceService.update(this.workspace);
  }

  deleteWorkspace(): void {
    if (
      confirm(
        `Are you sure you want to delete ${this.workspace.name}? This action cannot be undone.`
      )
    ) {
      this.workspaceService.delete(this.workspace);
      this.router.navigate(['/amyloid/workspaces']);
    }
  }
}
