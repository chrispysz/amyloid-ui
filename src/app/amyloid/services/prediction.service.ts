import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sequence } from '../models/sequence';
import { PredictionResponse } from '../models/predictionResponse';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor(private readonly httpClient: HttpClient) {}

  private readonly path = 'https://amylotool-backend.herokuapp.com/predict';

  predictSingle(sequence: string): Observable<any> {
    let data = {"sequence": sequence};

    return this.httpClient.post(`${this.path}/single`, data);
  }

  predictFull(sequence: string): Observable<any> {
    let data = {"sequence": sequence};

    return this.httpClient.post(`${this.path}/full`, data);
  }

}
