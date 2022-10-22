import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { from, concatMap } from 'rxjs';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit {
  workspace: Workspace | undefined;
  sequences: Sequence[] | undefined;
  predictionInProgress: boolean = false;
  idBeingPredicted: string | undefined;
  predictionProgress: number = 0;
  currentSequenceNumber: number = 1;
  lastSequenceNumber: number = 0;
  allResults: string = '';

  editActionDescription: string = '';
  selectedSequenceResults: string = '';

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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace']))
      .subscribe((result) => {
        this.workspace = result;
        this.sequences = result.sequences;
      });
  }

  showSequencePredictionResults(sequence: string, id: string): void {
    //TODO implement
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
            this.workspace!.sequences = this.sequences!;
            this.workspace!.updated = new Date().toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
            this.workspaceService.update(this.workspace!).subscribe(() => {
              this.toastr.success(
                `Sequence ${result.sequenceIdentifier} edited successfully`
              );
            });
          } else if (actionType == 'Add') {
            let sequence: Sequence = {
              id: Date.now().toString(),
              name: result.sequenceIdentifier,
              value: result.sequenceValue,
              state: 'PENDING',
              subsequences: [],
              predictLog: '',
            };
            this.sequences?.push(sequence);
            this.workspace!.sequences = this.sequences!;
            this.workspace!.updated = new Date().toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
            this.workspaceService.update(this.workspace!).subscribe(() => {
              this.toastr.success(
                `Sequence ${result.sequenceIdentifier} added successfully`
              );
            });
          }
        },
        () => {}
      );
  }

  openResultsModal(content: any, results: string) {
    this.selectedSequenceResults = results;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {},
        () => {}
      );
  }

  deleteSequence(sequenceId: string, sequenceName: string): void {
    if (confirm(`Are you sure you want to delete ${sequenceName}?`)) {
      this.sequences = this.sequences?.filter((s) => s.id != sequenceId);
      this.workspace!.sequences = this.sequences!;
      this.workspace!.updated = new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      this.workspaceService.update(this.workspace!).subscribe(() => {
        this.toastr.success('Sequence deleted successfully');
      });
      
    }
  }

  predict(sequence: string, id: string): void {
    this.predictionInProgress = true;
    this.idBeingPredicted = id;

    const sequences40 = this.createSubsequences(sequence);

    this.lastSequenceNumber = sequences40.length;

    this.predictionProgress = Math.round(
      (this.currentSequenceNumber / this.lastSequenceNumber) * 100
    );
    from(sequences40)
      .pipe(
        concatMap((sequence) => this.predictionService.predictSingle(sequence))
      )
      .subscribe((object: Object) => {
        if (this.currentSequenceNumber == this.lastSequenceNumber) {
          if (
            this.allResults.includes('Positive')
          ) {
            this.sequences!.find((s) => s.id == id)!.state = 'POSITIVE';
            this.sequences!.find((s) => s.id == id)!.predictLog =
              this.allResults;
            this!.workspace!.sequences = this.sequences!;
            this.workspaceService.update(this.workspace!).subscribe(() => {
              this.toastr.info(
                this.sequences!.find((s) => s.id == id)!.name,
                'POSITIVE'
              );
            });
          } else {
            this.sequences!.find((s) => s.id == id)!.state = 'NEGATIVE';
            this.sequences!.find((s) => s.id == id)!.predictLog =
              this.allResults;
            this!.workspace!.sequences = this.sequences!;
            this.workspaceService.update(this.workspace!).subscribe(() => {
              this.toastr.info(
                this.sequences!.find((s) => s.id == id)!.name,
                'NEGATIVE'
              );
            });
          }

          this.resetPredictionProgress();
        } else {
          if (this.currentSequenceNumber < this.lastSequenceNumber) {
            this.allResults += JSON.stringify(object) + '\n';
            this.currentSequenceNumber++;
          }
          this.predictionProgress = Math.round(
            (this.currentSequenceNumber / this.lastSequenceNumber) * 100
          );
        }
      });
  }

  private resetPredictionProgress(): void {
    this.predictionInProgress = false;
    this.predictionProgress = 0;
    this.currentSequenceNumber = 1;
    this.allResults = '';
  }

  private createSubsequences(sequence: string): string[] {
    const sequences40 = [];
    const characterSplits = sequence.split('');
    if (characterSplits.length < 40) {
      sequences40.push(sequence);
    } else {
      for (let i = 0; i < characterSplits.length; i++) {
        let sequence40 = characterSplits.slice(i, i + 40).join('');
        if (sequence40.length == 40) {
          sequences40.push(sequence40);
        }
      }
    }
    return sequences40;
  }
}
