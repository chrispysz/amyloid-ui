import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  concatMap,
  from,
  of,
  Subject,
  Subscription,
  takeUntil,
  throwError,
  timeout,
} from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { PredictionResponse } from '../../models/predictionResponse';
import { Workspace } from '../../models/workspace';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModelData } from '../../models/modelData';
import { serverTimestamp } from '@angular/fire/firestore';
import { ProcessStep } from '../../models/processStep';
import { ModelService } from '../../services/model.service';
import { PredictedSubsequence } from '../../models/predictedSubsequence';
import { FirestoreService } from '../../services/firestore.service';
import { FileStorageService } from '../../services/file-storage.service';
import { AuthService } from '../../services/auth.service';
import { WorkspaceHolderService } from '../../services/workspace-holder.service';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit, OnDestroy {
  page = 1;
  pageSize = 50;
  collectionSize!: number;
  pagedSequences: Sequence[] = [];

  workspace: Workspace | undefined;
  workspaceId: string = '';
  isLoading: boolean = true;
  sequences: Sequence[] = [];
  processSteps!: ProcessStep[];
  predictionInProgress: boolean = false;
  fullPredictionInProgress: boolean = false;
  idBeingPredicted: string | undefined;
  predictionProgress: number = 0;
  currentSequence: Sequence | undefined;
  logSequences: PredictedSubsequence[] | undefined;
  currentSelectedModelForPredictions: string = 'AmBERT';

  editActionDescription: string = '';

  sequenceDetailsModal = new FormGroup({
    sequenceIdentifier: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    sequenceValue: new FormControl('', [
      Validators.required,
      Validators.minLength(40),
      Validators.maxLength(1024),
    ]),
  });

  private subscription$ = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly predictionService: PredictionService,
    private readonly firestoreService: FirestoreService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceService: WorkspaceHolderService,
    private readonly modelService: ModelService,
    private readonly auth: AuthService,
    private readonly modalService: NgbModal,
    private readonly offcanvasService: NgbOffcanvas
  ) {}

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
  cancelPrediction() {
    this.subscription$.unsubscribe();
    this.resetPredictionProgress();
  }

  ngOnInit(): void {
    if (!this.auth.loggedIn() && !this.auth.userInSessionStorage()) {
      this.auth.logOut();
    }
    this.route.queryParams.subscribe((params) => {
      let workspaceId = params['id'];
      this.workspaceId = workspaceId;

      if (this.workspaceService.getWorkspace()) {
        this.initializePage(this.workspaceService.getWorkspace()!);
      } else {
        this.fileStorageService.loadWorkspace(workspaceId).then((workspace) => {
          this.workspaceService.setWorkspace(workspace);
          this.initializePage(workspace);
        });
      }
    });
  }

  initializePage(workspace: Workspace) {
    this.workspace = workspace;
    this.workspaceId = workspace.id;
    this.sequences = workspace.sequences;
    this.getPagedSequences();
    this.collectionSize = this.sequences!.length;
    this.processSteps = this.predictionService.getDefaultPredictionSteps();
    if (sessionStorage.getItem('selectedModel')) {
      let foundSelectedModel = this.modelService
        .getModels()
        .find(
          (m: ModelData) => m.id == sessionStorage.getItem('selectedModel')
        );
      if (foundSelectedModel) {
        this.currentSelectedModelForPredictions = foundSelectedModel.name;
      }
    }
  }

  getPagedSequences() {
    this.pagedSequences = this.fileStorageService.getSequencesByPage(
      this.page,
      this.pageSize,
      this.sequences!
    );
  }

  openEditModal(
    content: any,
    actionType: string,
    seqIdentifier: string,
    seqValue: string,
    seqId: string
  ) {
    this.editActionDescription = actionType;
    this.sequenceDetailsModal.controls['sequenceIdentifier'].setValue(
      seqIdentifier
    );
    this.sequenceDetailsModal.controls['sequenceValue'].setValue(seqValue);
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (actionType == 'Edit') {
            let seq = this.workspace!.sequences.find((s) => s.id == seqId)!;
            if (
              seq.value != result.sequenceValue &&
              confirm(
                `Are you sure you want to edit this sequence? This will reset the predictions for this sequence.`
              )
            ) {
              seq.value = result.sequenceValue;
              seq.modelPredictions = [];
              seq.predictLogs = [];
            }
            seq.name = result.sequenceIdentifier;
          } else if (actionType == 'Add') {
            let sequence: Sequence = {
              id: Date.now().toString(),
              name: result.sequenceIdentifier,
              value: result.sequenceValue,
              modelPredictions: [],
              predictLogs: [],
            };
            this.workspace!.sequences?.push(sequence);
          }
          this.dbUpdate();
        },
        () => {}
      );
  }

  dbUpdate() {
    this.firestoreService.get(this.workspaceId).then((dbRef) => {
      this.fileStorageService.uploadWorkspace(
        new Blob([JSON.stringify(this.workspace)], {
          type: 'application/json',
        }),
        this.workspaceId
      );

      dbRef.lastModified = serverTimestamp();
      this.firestoreService.update(dbRef);
    });
  }

  openResultsModal(content: any, sequence: Sequence) {
    this.currentSequence = sequence;
    this.logSequences = this.getPredictionsArrayFromLogs(this.currentSequence);

    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' })
      .result.then(
        () => {},
        () => {}
      );
  }

  getPredictionsArrayFromLogs(value: Sequence): PredictedSubsequence[] {
    let subseqs: PredictedSubsequence[] = [];
    if (value) {
      value.predictLogs.forEach((predictLog) => {
        if (predictLog.model == this.currentSelectedModelForPredictions) {
          subseqs = JSON.parse(predictLog.log);
        }
      });
    }
    return subseqs;
  }

  getColoredRepresentation(sequence: Sequence) {
    let coloredSequence = sequence.value;
    let subseqs = this.getPredictionsArrayFromLogs(sequence);
    subseqs.forEach((subseq) => {
      if (parseFloat(subseq.prediction) > 0.5) {
        coloredSequence = coloredSequence.replace(
          subseq.sequence,
          `<span class="text-success">${subseq.sequence}</span>`
        );
      }
    });
    return coloredSequence;
  }

  openPredictionModelsOffCanvas(content: any) {
    this.offcanvasService
      .open(content, { ariaLabelledBy: 'offcanvas-basic-title' })
      .result.then(
        () => {},
        () => {}
      );
  }

  deleteSequence(sequence: Sequence): void {
    if (confirm(`Are you sure you want to delete ${sequence.name}?`)) {
      this.workspace!.sequences = this.workspace!.sequences.filter(
        (s) => s.id != sequence.id
      );
      this.dbUpdate();
    }
  }

  predictAll(model: string): void {
    this.processSteps = this.predictionService.getDefaultPredictionSteps();
    this.predictionInProgress = true;
    this.fullPredictionInProgress = true;
    let currentIndex = 0;
    let lastIndex = this.sequences!.length - 1;

    this.processSteps[0].status = 'IN_PROGRESS';
    this.predictionService
      .checkServiceAvailability(model)
      .pipe(
        catchError((error) => {
          this.processSteps[0].status = 'FAILED';
          if (error.status == 404) {
            this.processSteps[0].notes[0] = 'Model not found';
          } else {
            this.processSteps[0].notes[0] = 'Connection failed';
          }
          this.resetPredictionProgress();
          throw error;
        })
      )
      .subscribe(() => {
        this.processSteps[0].status = 'SUCCESSFUL';
        this.processSteps[0].notes[0] = 'Connection established';
        this.processSteps[1].status = 'IN_PROGRESS';

        const _sequences = from(this.sequences!);

        this.idBeingPredicted = this.sequences![currentIndex].id;
        this.processSteps[1].notes[0] = `Predicting ${
          this.sequences![currentIndex].name
        }`;
        this.processSteps[1].notes[1] =
          this.predictionProgress.toString() + '% done';

        this.subscription$ = _sequences
          .pipe(
            concatMap((sequence) => {
              if (sequence.modelPredictions.find((p) => p.model == model)) {
                return of(null);
              }
              return this.predictionService.predictFull(
                this.currentSelectedModelForPredictions,
                sequence.value
              );
            }),
            catchError((error) => {
              this.processSteps[1].status = 'FAILED';
              this.processSteps[1].notes[1] = 'Error during prediction';
              this.resetPredictionProgress();
              throw error;
            })
          )
          .subscribe((response: PredictionResponse) => {
            if (response) {
              let seq = this.sequences!.find(
                (s) => s.id == this.sequences![currentIndex].id
              )!;
              let newState =
                response.classification == 'Positive' ? 'POSITIVE' : 'NEGATIVE';
              seq.modelPredictions.push({
                model: model,
                state: newState,
              });
              seq.predictLogs.push({
                model: model,
                log: response.result.toString().replace(/'/g, '"'),
              });
            }

            if (currentIndex == lastIndex) {
              this.processSteps[1].status = 'SUCCESSFUL';
              this.processSteps[2].status = 'IN_PROGRESS';
              this.sleep(1800).then(() => {
                this.dbUpdate();
                this.processSteps[2].status = 'SUCCESSFUL';
                this.resetPredictionProgress();
              });
            } else {
              if (
                (currentIndex <= 10 && currentIndex % 10 == 0) ||
                (currentIndex <= 100 && currentIndex % 100 == 0) ||
                currentIndex % 1000 == 0
              ) {
                this.dbUpdate();
              }
              currentIndex++;
              this.idBeingPredicted = this.sequences![currentIndex].id;
              this.processSteps[1].notes[0] = `Predicting ${
                this.sequences![currentIndex].name
              }`;
              this.predictionProgress = Math.round(
                (currentIndex / lastIndex) * 100
              );
              this.processSteps[1].notes[1] =
                this.predictionProgress.toString() + '% done';
            }
          });
      });
  }

  sleep(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  predict(sequence: string, id: string, model: string): void {
    this.predictionInProgress = true;
    this.idBeingPredicted = id;
    let seq = this.sequences!.find((s) => s.id == id)!;
    this.predictionService.checkServiceAvailability(model).subscribe(() => {
      this.predictionService
        .predictFull(model, sequence)
        .pipe(
          timeout({
            each: 60_000,
            with: () => throwError(() => new Error('Timeout')),
          }),
          catchError(() => {
            this.resetPredictionProgress();
            return throwError(
              () => new Error('Error during prediction for model: ' + model)
            );
          })
        )
        .subscribe((response: PredictionResponse) => {
          let newState =
            response.classification == 'Positive' ? 'POSITIVE' : 'NEGATIVE';

          seq.modelPredictions.push({
            model: model,
            state: newState,
          });

          seq.predictLogs.push({
            model: model,
            log: response.result.toString().replace(/'/g, '"'),
          });
          this.dbUpdate();

          this.resetPredictionProgress();
        });
    });
  }

  hasPredictionsForCurrentModel(sequence: Sequence): boolean {
    return sequence.modelPredictions.find(
      (p) => p.model == this.currentSelectedModelForPredictions
    )
      ? true
      : false;
  }

  private resetPredictionProgress(): void {
    this.predictionInProgress = false;
    this.idBeingPredicted = '';
    this.predictionProgress = 0;
  }

  handleModelClicked(model: ModelData) {
    this.currentSelectedModelForPredictions = model.name;
  }

  getStateForCurrentModel(sequence: Sequence): string {
    let state = 'PENDING';
    sequence.modelPredictions.forEach((modelPrediction) => {
      if (modelPrediction.model == this.currentSelectedModelForPredictions) {
        state = modelPrediction.state;
      }
    });

    return state;
  }
}
