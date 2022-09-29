import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmyloidDashboardComponent } from './components/amyloid-dashboard/amyloid-dashboard.component';
import { AmyloidWorkspaceComponent } from './components/amyloid-workspace/amyloid-workspace.component';
import { WorkspaceService } from './services/workspace.service';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SequenceService } from './services/sequence.service';
import { SubsequenceService } from './services/subsequence.service';
import { FileProcessingService } from './services/file-processing.service';

@NgModule({
  declarations: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent,
    NotFoundComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    WorkspaceService,
    SequenceService,
    SubsequenceService,
    FileProcessingService,
  ],
  exports: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent,
    NotFoundComponent,
  ],
})
export class AmyloidModule {}
