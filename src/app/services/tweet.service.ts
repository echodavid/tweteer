import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Tweet } from '../models/tweets/Tweets';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class TweetService {
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
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + this.token,
    }),
  };

  getTweetById(id: number): Observable<Tweet> {
    return this.http
      .get<Tweet>(this.apiURL + 'api/tweets/' + id, this.getHttpOptions())
      .pipe(retry(1), catchError(this.handleError));

  }

  errorMessage = '';

  getTweets(): Observable<Tweet> {
    console.log('tweets: ' + this.apiURL + 'api/tweets/all');
    return this.http
      .get<Tweet>(this.apiURL + 'api/tweets/all', this.getHttpOptions())
      .pipe(retry(1), catchError(this.handleError));
  }

  getHttpOptions() {
    const token = this.storageService.getSession('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token, // This should be 'Bearer <your_token>'
      }),
    };
  }
  postTweet(myTweet: string) {
    const body = { tweet: myTweet };
    return this.http
      .post<Tweet>(
        this.apiURL + 'api/tweets/create',
        body,
        this.getHttpOptions()
      )
      .pipe(catchError(this.handleError));
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


