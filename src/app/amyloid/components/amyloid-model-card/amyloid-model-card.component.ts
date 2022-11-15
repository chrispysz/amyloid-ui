import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ModelData } from '../../models/modelData';
import { ModelService } from '../../services/model.service';

@Component({
  selector: 'app-amyloid-model-card',
  templateUrl: './amyloid-model-card.component.html',
  styleUrls: ['./amyloid-model-card.component.scss'],
})
export class AmyloidModelCardComponent implements OnInit {
  @Output() modelSelected = new EventEmitter<ModelData>();

  modelCards: ModelData[] | undefined;

  selectedCardId: string = '';

  constructor(private readonly modelService: ModelService) {}

  ngOnInit(): void {
    this.modelCards = this.modelService.getModels();
    if (sessionStorage.getItem('selectedModel')) {
      this.selectedCardId = sessionStorage.getItem('selectedModel')!;
    } else {
      this.selectedCardId = this.modelCards![0].id;
    }
  }

  handleModelClick(value: ModelData) {
    this.selectedCardId = value.id;
    sessionStorage.setItem('selectedModel', value.id);
    this.modelSelected.emit(value);
  }

  isSelected(model: ModelData): boolean {
    return model.id == this.selectedCardId;
  }
}
