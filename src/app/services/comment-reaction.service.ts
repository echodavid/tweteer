import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentReactionRequest {
  reactionId: number;
}

export interface CommentReactionResponse {
  commentId: number;
  reactionType: string;
  count: number;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentReactionService {
  private apiURL = 'http://localhost:8080/api/comments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (token ? token.replace(/^"|"$/g, '') : '')
    });
  }

  reactToComment(commentId: number, reactionId: number): Observable<CommentReactionResponse> {
    const body: CommentReactionRequest = { reactionId };
    return this.http.post<CommentReactionResponse>(
      `${this.apiURL}/${commentId}/react`,
      body,
      { headers: this.getHeaders() }
    );
  }

  getCommentReactions(commentId: number): Observable<CommentReactionResponse[]> {
    return this.http.get<CommentReactionResponse[]>(
      `${this.apiURL}/${commentId}/reactions`,
      { headers: this.getHeaders() }
    );
  }
}
