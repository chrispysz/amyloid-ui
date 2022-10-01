import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sequence } from '../models/sequence';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor(private readonly httpClient: HttpClient) {}

  private readonly path = 'https://amylotool-backend.onrender.com/predict';

  predictSingle(sequence: string): Observable<Object> {
    let data = {"sequence": sequence};

    return this.httpClient.post(`${this.path}/single`, data);
  }

}
