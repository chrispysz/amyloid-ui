import { Component, OnInit } from '@angular/core';
import { Sequence } from '../../models/sequence';

@Component({
  selector: 'app-amyloid-workspace-results',
  templateUrl: './amyloid-workspace-results.component.html',
  styleUrls: ['./amyloid-workspace-results.component.scss'],
})
export class AmyloidWorkspaceResultsComponent implements OnInit {
  sequences: Sequence[] = [];
  constructor() {
  }

  ngOnInit(): void {
    console.log(this.sequences);
  }

  getAminoacidsArray(seq: Sequence) {
    return [...seq.value];
  }

  isIndexPositive(){
    
  }
}
