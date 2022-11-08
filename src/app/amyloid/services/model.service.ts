import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  models = [
    {
      id: 1,
      name: 'AmBERT',
      description: 'This is a description of AmBERT',
      imageUrl:
        'https://camo.githubusercontent.com/b253a30b83a0724f3f74f3f58236fb49ced8d7b27cb15835c9978b54e444ab08/68747470733a2f2f68756767696e67666163652e636f2f64617461736574732f68756767696e67666163652f646f63756d656e746174696f6e2d696d616765732f7265736f6c76652f6d61696e2f7472616e73666f726d6572735f6c6f676f5f6e616d652e706e67',
      apiPath: 'https://amylotool-backend.herokuapp.com/predict/single',
    },
    {
      id: 2,
      name: 'LSTM',
      description: 'This is a description of LSTM',
      imageUrl:
        'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      apiPath: 'https://amylotool-backend.herokuapp.com/predict/single',
    }
  ];

  constructor() {}

  getModels(): any {
    return this.models;
  }
}
