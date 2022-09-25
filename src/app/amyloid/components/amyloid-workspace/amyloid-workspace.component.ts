import { Component, OnDestroy, OnInit } from '@angular/core';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable, pipe, Subject, Subscription, tap } from 'rxjs';
import { FormsModule, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-amyloid-workspace',
  templateUrl: './amyloid-workspace.component.html',
  styleUrls: ['./amyloid-workspace.component.scss'],
})
export class AmyloidWorkspaceComponent implements OnInit, OnDestroy {
  workspaces$: Observable<Workspace[]> | undefined =
    this.workspaceService.getAll();
  workspacesLength$: Observable<number> | undefined = this.workspaces$?.pipe(
    map((workspaces) => workspaces.length)
  );

  private readonly refreshRequired$ = new Subject<void>();

  workspaceModal = new FormGroup({
    name: new FormControl('')
  });

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.refreshRequired$.subscribe(() => {
      this.workspaces$ = this.workspaceService.getAll();
      this.workspacesLength$ = this.workspaces$?.pipe(
        map((workspaces) => workspaces.length)
      );
    });
  }

  addWorkspace(workspace: Workspace): void {
    this.workspaceService.add(workspace).subscribe((object: Object) => {
      console.log(`Added with response: ${object}`);
      this.refreshRequired$.next();
    });
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          console.log(`Closed with: ${result}`);
          this.addWorkspace({
            id: Date.now().toString(),
            name: result.name,
            created: new Date().toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            updated: new Date().toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        },
        () => {}
      );
  }

  ngOnDestroy(): void {
    this.refreshRequired$.complete();
  }
}
