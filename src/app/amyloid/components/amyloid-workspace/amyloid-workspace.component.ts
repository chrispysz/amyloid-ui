import { Component, OnInit } from '@angular/core';
import { Workspace } from '../../models/workspace';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileProcessingService } from '../../services/file-processing.service';
import { Sequence } from '../../models/sequence';
import { AuthService } from '../../services/auth.service';
import { FileStorageService } from '../../services/file-storage.service';
import { FirestoreService } from '../../services/firestore.service';
import { WorkspaceDbReference } from '../../models/workspace-db-reference';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-amyloid-workspace',
  templateUrl: './amyloid-workspace.component.html',
  styleUrls: ['./amyloid-workspace.component.scss'],
})
export class AmyloidWorkspaceComponent implements OnInit {
  constructor(
    private readonly fileProcessingService: FileProcessingService,
    private readonly modalService: NgbModal,
    private readonly fileStorageService: FileStorageService,
    private readonly firestoreService: FirestoreService,
    private readonly authService: AuthService
  ) {}

  workspaces: WorkspaceDbReference[] | undefined;

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

  workspaceLoginForm = new FormGroup({
    emailInput: new FormControl('', [Validators.required, Validators.email]),
    passwordInput: new FormControl('', [Validators.required]),
  });

  validFile: boolean = false;
  fileImportError: boolean = false;
  addedSequencesCount: number = 0;
  addedSequences: Sequence[] = [];

  ngOnInit(): void {
    if(this.loggedIn()) {
      let user = JSON.parse(sessionStorage.getItem('user')!);
      if (user && user['uid']){
        this.firestoreService
        .getUserWorkspaces(user['uid'])
        .then((workspaces) => {
          this.workspaces = workspaces;
        });
      }
    }
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logIn(values: any) {
    this.authService.logIn(values.emailInput, values.passwordInput).then(() => {
      this.firestoreService
        .getUserWorkspaces(this.authService.getUserId())
        .then((workspaces) => {
          this.workspaces = workspaces;
        });
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

  open(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let wsId = Date.now().toString();
          let savePath = this.authService.getUserId() + '/' + wsId;

          if (result.importedFile) {
            let workspace: Workspace = {
              id: wsId,
              name: this.fileProcessingService.cleanFileName(
                result.importedFile.toString()
              ),
              sequences: this.addedSequences,
            };

            let workspaceDbReference: WorkspaceDbReference = {
              id: wsId,
              userId: this.authService.getUserId(),
              name: this.fileProcessingService.cleanFileName(
                result.importedFile.toString()
              ),
              lastModified: serverTimestamp(),
            };

            this.createNewWorkspace(workspace, savePath, workspaceDbReference);
          } else {
            let workspace: Workspace = {
              id: wsId,
              name: result.name,
              sequences: [],
            };

            let workspaceDbReference: WorkspaceDbReference = {
              id: wsId,
              userId: this.authService.getUserId(),
              name: result.name,
              lastModified: serverTimestamp(),
            };
            this.createNewWorkspace(workspace, savePath, workspaceDbReference);
          }
          this.resetModalData();
        },
        () => {
          this.resetModalData();
        }
      );
  }

  createNewWorkspace(
    workspace: Workspace,
    savePath: string,
    workspaceDbReference: WorkspaceDbReference
  ): void {
    this.fileStorageService.uploadWorkspace(
      new Blob([JSON.stringify(workspace)], {
        type: 'application/json',
      }),
      savePath
    );
    this.firestoreService.add(workspaceDbReference);
    this.workspaces?.push(workspaceDbReference);
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

  getDateFromTimestamp(timestamp: any): string {
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '';
  }
}
