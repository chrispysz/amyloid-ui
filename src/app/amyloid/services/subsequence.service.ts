import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subsequence } from '../models/subsequence';

@Injectable({
  providedIn: 'root',
})
export class SubsequenceService {
  constructor(private readonly httpClient: HttpClient) {}

  private readonly path = 'https://amylotool-backend.onrender.com/subsequence';

  get(id: number): Observable<Subsequence> {
    return this.httpClient.get<Subsequence>(`${this.path}/list/${id}`);
  }

  getAll(): Observable<Subsequence[]> {
    return this.httpClient.get<Subsequence[]>(`${this.path}/list`);
  }

  add(workspace: Subsequence): Observable<Object> {
    return this.httpClient.post(`${this.path}/add`, workspace);
  }
}
