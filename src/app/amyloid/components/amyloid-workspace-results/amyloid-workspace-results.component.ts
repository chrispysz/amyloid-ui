import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { Sequence } from '../../models/sequence';
import { Workspace } from '../../models/workspace';

@Component({
  selector: 'app-amyloid-workspace-results',
  templateUrl: './amyloid-workspace-results.component.html',
  styleUrls: ['./amyloid-workspace-results.component.scss'],
})
export class AmyloidWorkspaceResultsComponent implements OnInit {
  workspace: Workspace
  constructor(private readonly route: ActivatedRoute) {

    this.workspace = this.route.snapshot.data['workspace'];
  }

  ngOnInit(): void {
    console.log(this.workspace);
  }

  getAminoacidsArray(seq: Sequence) {
    return [...seq.value];
  }

  isIndexPositive(){
    
  }
}
