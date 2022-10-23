import { Component, OnDestroy, OnInit } from '@angular/core';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable, of, Subject, concatMap, from, delay } from 'rxjs';
import {
  FormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PredictionService } from '../../services/prediction.service';
import { FileProcessingService } from '../../services/file-processing.service';
import { Sequence } from '../../models/sequence';
import { ToastrService } from 'ngx-toastr';

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
  private readonly reader = new FileReader();

  workspaceModal = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(30),
    ]),
  });
  workspaceFileImportModal = new FormGroup({
    importedFile: new FormControl('', [Validators.required]),
  });

  validFile: boolean = false;
  fileImportError: boolean = false;
  addedSequencesCount: number = 0;
  addedSequences: Sequence[] = [];

  constructor(
    private readonly sequenceService: PredictionService,
    private readonly fileProcessingService: FileProcessingService,
    private readonly workspaceService: WorkspaceService,
    private readonly modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.refreshRequired$.subscribe(() => {
      this.workspaces$ = this.workspaceService.getAll();
      this.workspacesLength$ = this.workspaces$?.pipe(
        map((workspaces) => workspaces.length)
      );
    });
  }

  private resetModalData(): void {
    this.workspaceModal.reset();
    this.workspaceFileImportModal.reset();
    this.validFile = false;
  this.fileImportError = false;
  this.addedSequencesCount = 0;
  this.addedSequences = [];
  }

  addWorkspace(workspace: Workspace): void {
    this.workspaceService.add(workspace).subscribe(() => {
      this.refreshRequired$.next();
      this.toastr.success(`Workspace ${workspace.name} added successfully`);
    });
  }

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (result.importedFile) {
            this.addWorkspace({
              id: Date.now().toString(),
              name: this.fileProcessingService.cleanFileName(
                result.importedFile.toString()
              ),
              sequences: this.addedSequences,
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
          } else {
            this.addWorkspace({
              id: Date.now().toString(),
              name: result.name,
              sequences: this.addedSequences,
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
          }
          this.resetModalData();
        },
        () => {this.resetModalData();}
      );
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.reader.readAsText(file);
      this.reader.onloadend = () => {
        if (
          this.reader.result &&
          this.fileProcessingService.fileContentProcessable(
            this.reader.result.toString()
          )
        ) {
          this.fileImportError = false;
          this.validFile = true;
          this.addedSequences =
            this.fileProcessingService.prepareSequenceObjects(
              this.reader.result.toString()
            );
          this.addedSequencesCount = this.addedSequences.length;
        } else {
          this.fileImportError = true;
          this.validFile = false;
          this.addedSequences = [];
          this.addedSequencesCount = 0;
        }
      };
    }
  }

  ngOnDestroy(): void {
    this.refreshRequired$.complete();
  }
}
