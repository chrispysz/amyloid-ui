import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ModelData } from '../../models/modelData';
import { ModelService } from '../../services/model.service';


@Component({
  selector: 'app-amyloid-model-card',
  templateUrl: './amyloid-model-card.component.html',
  styleUrls: ['./amyloid-model-card.component.scss']
})
export class AmyloidModelCardComponent implements OnInit {
  @Output() modelSelected = new EventEmitter<ModelData>();

  modelCards: ModelData[] | undefined;

  constructor(private readonly modelService: ModelService) { }

  ngOnInit(): void {
    this.modelCards = this.modelService.getModels();
  }

  handleModelClick(value: ModelData) {
    //TODO: add logic to handle model selection
  }
  

}
