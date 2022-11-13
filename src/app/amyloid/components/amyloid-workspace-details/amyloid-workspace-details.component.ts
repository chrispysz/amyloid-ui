import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, concatMap, from, map, throwError } from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { PredictionResponse } from '../../models/predictionResponse';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModelData } from '../../models/modelData';
import { serverTimestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit {
  workspace!: Workspace;
  sequences: Sequence[] | undefined;
  predictionInProgress: boolean = false;
  idBeingPredicted: string | undefined;
  predictionProgress: number = 0;
  currentSequence: Sequence | undefined;
  logFilteredSequence: Sequence | undefined;
  currentSelectedModelForLogs: string = '';
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
    private readonly modalService: NgbModal,
    private readonly offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace']))
      .subscribe((result) => {
        this.workspace = result;
        this.sequences = result.sequences;
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
              state: 'PENDING',
              subsequences: [],
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
    this.logFilteredSequence = { ...this.currentSequence };
    this.filterLogsByModel('AmBERT');
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', size: 'xl' })
      .result.then(
        (result) => {},
        () => {}
      );
  }

  openPredictionModelsOffCanvas(content: any) {
    this.offcanvasService
      .open(content, { ariaLabelledBy: 'offcanvas-basic-title' })
      .result.then(
        (result) => {},
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
    this.predictionInProgress = true;
    let currentIndex = 0;
    let lastIndex = this.sequences!.length - 1;

    const _sequences = from(this.sequences!);

    this.idBeingPredicted = this.sequences![currentIndex].id;

    _sequences
      .pipe(
        concatMap((sequence) =>
          this.predictionService.predictFull(
            this.currentSelectedModelForPredictions,
            sequence.value
          )
        ),
        catchError((error) => {
          console.error(error);
          return error;
        })
      )
      .subscribe((response: PredictionResponse) => {
        let seq = this.sequences!.find(
          (s) => s.id == this.sequences![currentIndex].id
        )!;
        let newState =
          response.classification == 'Positive' ? 'POSITIVE' : 'NEGATIVE';
        seq.state = newState;
        seq.predictLogs.push({
          model: model,
          log: response.result.toString().replace(/'/g, '"'),
        });
        this.workspace.sequences = this.sequences!;

        if (currentIndex == lastIndex) {
          this.workspace.updated = serverTimestamp();
          this.workspaceService.update(this.workspace);
          this.resetPredictionProgress();
        } else {
          currentIndex++;
          this.idBeingPredicted = this.sequences![currentIndex].id;
          this.predictionProgress = Math.round(
            (currentIndex / lastIndex) * 100
          );
        }
      });
  }

  predict(sequence: string, id: string, model: string): void {
    this.predictionInProgress = true;
    this.idBeingPredicted = id;
    let seq = this.sequences!.find((s) => s.id == id)!;

    this.predictionService
      .predictFull(model, sequence)
      .pipe(
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
        seq.state = newState;

        seq.predictLogs.push({
          model: model,
          log: response.result.toString().replace(/'/g, '"'),
        });
        this.workspace.sequences = this.sequences!;
        this.workspace.updated = serverTimestamp();
        this.workspaceService.update(this.workspace);

        this.resetPredictionProgress();
      });
  }

  private resetPredictionProgress(): void {
    this.predictionInProgress = false;
    this.predictionProgress = 0;
  }

  handleModelClicked(model: ModelData) {
    this.currentSelectedModelForPredictions = model.name;
  }

  onLogModelSelect(selection: string) {
    this.filterLogsByModel(selection);
  }

  filterLogsByModel(model: string) {
    const selectedLogs = this.currentSequence!.predictLogs.filter(
      (s) => s.model == model
    );
    this.logFilteredSequence!.predictLogs = selectedLogs;
  }
}
