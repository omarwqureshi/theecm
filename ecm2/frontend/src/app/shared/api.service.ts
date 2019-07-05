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
  api: string = 'http://localhost:4000/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http:HttpClient) { }

  GetEnvironments() {
    return this.http.get(`${this.endpoint}`);
  }
  StartEnvironment(body) {
    const API_URL = `${this.api}/start`;
    console.log(body);
    return this.http.post(API_URL, body, {headers: this.headers}).pipe(
      catchError(this.errorMgmt)
    );
  }

  DeleteEnvironment(body) {
    const API_URL = `${this.api}/delete`;
    console.log(body);
    return this.http.post(API_URL, body, {headers: this.headers}).pipe(
      catchError(this.errorMgmt)
    );
  }

  StopEnvironments(body) {
    const API_URL = `${this.api}/stop`;
    console.log(body);
    return this.http.post(API_URL, body, {headers: this.headers}).pipe(
      catchError(this.errorMgmt)
   );

  }

  errorMgmt(error: HttpErrorResponse){
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      // get client side error
      errorMessage = error.error.message;
    } else {
      // get server side error
      errorMessage = `Error Code:${error.status}\nMessage:${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}
