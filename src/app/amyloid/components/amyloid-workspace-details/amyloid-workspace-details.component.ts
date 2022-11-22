import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, concatMap, from, map, throwError, timeout } from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { PredictionResponse } from '../../models/predictionResponse';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModelData } from '../../models/modelData';
import { serverTimestamp } from '@angular/fire/firestore';
import { ProcessStep } from '../../models/processStep';
import { ModelService } from '../../services/model.service';
import { PredictedSubsequence } from '../../models/predictedSubsequence';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit {
  workspace!: Workspace;
  sequences: Sequence[] | undefined;
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
      Validators.maxLength(30),
    ]),
    sequenceValue: new FormControl('', [
      Validators.required,
      Validators.minLength(40),
      Validators.maxLength(500),
    ]),
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly predictionService: PredictionService,
    private readonly workspaceService: WorkspaceService,
    private readonly modelService: ModelService,
    private readonly modalService: NgbModal,
    private readonly offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace']))
      .subscribe((result) => {
        this.workspace = result;
        this.sequences = result.sequences;
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
      });
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
            this.sequences!.find((s) => s.id == seqId)!.name =
              result.sequenceIdentifier;
            this.sequences!.find((s) => s.id == seqId)!.value =
              result.sequenceValue;
            this.workspace.sequences = this.sequences!;
            this.workspace.updated = serverTimestamp();
            this.workspaceService.update(this.workspace);
          } else if (actionType == 'Add') {
            let sequence: Sequence = {
              id: Date.now().toString(),
              name: result.sequenceIdentifier,
              value: result.sequenceValue,
              modelPredictions: [],
              predictLogs: [],
            };
            this.sequences?.push(sequence);
            this.workspace.sequences = this.sequences!;
            this.workspace.updated = serverTimestamp();
            this.workspaceService.update(this.workspace);
          }
        },
        () => {}
      );
  }

  openResultsModal(content: any, sequence: Sequence) {
    this.currentSequence = sequence;
    this.logSequences = this.parseJson(this.currentSequence);

    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' })
      .result.then(
        () => {},
        () => {}
      );
  }

  parseJson(value: Sequence): PredictedSubsequence[] {
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

  openPredictionModelsOffCanvas(content: any) {
    this.offcanvasService
      .open(content, { ariaLabelledBy: 'offcanvas-basic-title' })
      .result.then(
        () => {},
        () => {}
      );
  }

  deleteSequence(sequenceId: string, sequenceName: string): void {
    if (confirm(`Are you sure you want to delete ${sequenceName}?`)) {
      this.sequences = this.sequences?.filter((s) => s.id != sequenceId);
      this.workspace.sequences = this.sequences!;
      this.workspace.updated = serverTimestamp();
      this.workspaceService.update(this.workspace);
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

        _sequences
          .pipe(
            concatMap((sequence) =>
              this.predictionService.predictFull(
                this.currentSelectedModelForPredictions,
                sequence.value
              )
            ),
            catchError((error) => {
              this.processSteps[1].status = 'FAILED';
              this.processSteps[1].notes[1] = 'Error during prediction';
              this.resetPredictionProgress();
              throw error;
            })
          )
          .subscribe((response: PredictionResponse) => {
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
            this.workspace.sequences = this.sequences!;

            if (currentIndex == lastIndex) {
              this.processSteps[1].status = 'SUCCESSFUL';
              this.processSteps[2].status = 'IN_PROGRESS';
              this.sleep(1800).then(() => {
                this.workspace.updated = serverTimestamp();
                this.workspaceService.update(this.workspace);
                this.processSteps[2].status = 'SUCCESSFUL';
                this.resetPredictionProgress();
              });
            } else {
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
          this.workspace.sequences = this.sequences!;
          this.workspace.updated = serverTimestamp();
          this.workspaceService.update(this.workspace);

          this.resetPredictionProgress();
        });
    });
  }

  private resetPredictionProgress(): void {
    this.predictionInProgress = false;
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
