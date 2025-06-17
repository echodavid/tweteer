import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface ReactionRequest {
  tweetId: number;
  reactionId: number;
}

export interface ReactionResponse {
  id: number;
  tweetId: number;
  reactionId: number;
  username: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReactionService {
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

  reactToTweet(request: ReactionRequest): Observable<ReactionResponse> {
    return this.http
      .post<ReactionResponse>(
        this.apiURL + 'api/tweet-reactions/create',
        request,
        this.getHttpOptions()
      )
      .pipe(catchError(this.handleError));
  }

  getReactionsByTweet(tweetId: number): Observable<ReactionResponse[]> {
    return this.http
      .get<ReactionResponse[]>(
        this.apiURL + `api/tweet-reactions/by-tweet/${tweetId}`,
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
