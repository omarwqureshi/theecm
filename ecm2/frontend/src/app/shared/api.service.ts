import { Injectable } from '@angular/core';
import {Environment} from '../model/environment';
import {Observable, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  endpoint: string = 'http://localhost:4000/api/environments';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http:HttpClient) { }

  GetEnvironments() {
    return this.http.get(`${this.endpoint}`);
  }
}
