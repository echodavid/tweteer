import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { CommentRequest } from '../models/tweets/CommentRequest';
import { CommentResponse } from '../models/tweets/CommentResponse';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  apiURL = 'http://localhost:8080/';
  token = '';
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.token = this.storageService.getSession('token');
    console.log('Token from storage: ' + this.token);
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.token,
    }),
  };

  errorMessage = '';

  createComment(request: CommentRequest): Observable<CommentResponse> {
    return this.http
      .post<CommentResponse>(
        this.apiURL + 'api/comments/create',
        request,
        this.getHttpOptions()
      )
      .pipe(catchError(this.handleError));
  }

  getCommentsByTweet(tweetId: number): Observable<CommentResponse[]> {
    return this.http
      .get<CommentResponse[]>(
        this.apiURL + `api/comments/by-tweet/${tweetId}`,
        this.getHttpOptions()
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  getHttpOptions() {
    const token = this.storageService.getSession('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      }),
    };
  }

  

  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
