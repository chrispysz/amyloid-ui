import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Workspace } from '../../models/workspace';
import { WorkspaceDbReference } from '../../models/workspace-db-reference';
import { FileStorageService } from '../../services/file-storage.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-amyloid-workspace-settings',
  templateUrl: './amyloid-workspace-settings.component.html',
  styleUrls: ['./amyloid-workspace-settings.component.scss'],
})
export class AmyloidWorkspaceSettingsComponent implements OnInit {
  workspace: WorkspaceDbReference | undefined;
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
    private readonly firestoreService: FirestoreService,
    private readonly fileStorageService: FileStorageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      let workspaceId = params['id'];
      this.firestoreService.get(workspaceId).then((workspace) => {
        this.workspace = workspace;
        this.isLoading = false;
        this.workspaceSettingsForm.controls['workspaceName'].setValue(
          this.workspace.name
        );
      });
    });
  }

  async saveSettings(fields: any) {
    let fullWorkspace = await this.fileStorageService.loadWorkspace(this.workspace!.id);
    this.workspace!.name = fields.workspaceName;
    fullWorkspace.name = fields.workspaceName;
    this.fileStorageService.uploadWorkspace(new Blob([JSON.stringify(fullWorkspace)], {
      type: 'application/json',
    }), this.workspace!.id);
    this.firestoreService.update(this.workspace!);
  }

  deleteWorkspace(): void {
    if (
      confirm(
        `Are you sure you want to delete ${this.workspace!.name}? This action cannot be undone.`
      )
    ) {
     this.fileStorageService.deleteWorkspace(this.workspace!.id);
     this.firestoreService.delete(this.workspace!.id);
      this.router.navigate(['/amyloid/workspaces']);
    }
  }
}
