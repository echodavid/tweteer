import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient: Client;
  private isConnected = false;
  private subscriptions: { [topic: string]: StompSubscription } = {};

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str) => {
        /* console.log(str); */
      },
    });

    this.stompClient.onConnect = () => {
      this.isConnected = true;
    };
    this.stompClient.onDisconnect = () => {
      this.isConnected = false;
    };
    this.stompClient.activate();
  }

  private waitForConnection(callback: () => void) {
    if (this.isConnected) {
      callback();
    } else {
      setTimeout(() => this.waitForConnection(callback), 100);
    }
  }

  subscribe(topic: string): Observable<any> {
    return new Observable<any>((observer: Subscriber<any>) => {
      this.waitForConnection(() => {
        if (!this.subscriptions[topic]) {
          this.subscriptions[topic] = this.stompClient.subscribe(
            topic,
            (message: IMessage) => {
              observer.next(JSON.parse(message.body));
            }
          );
        }
      });

      // Teardown logic
      return () => {
        this.unsubscribe(topic);
      };
    });
  }

  unsubscribe(topic: string): void {
    if (this.subscriptions[topic]) {
      this.subscriptions[topic].unsubscribe();
      delete this.subscriptions[topic];
    }
  }

  // === Comentarios de tweets ===
  subscribeToComments(tweetId: number): Observable<any> {
    return this.subscribe(`/topic/comments/${tweetId}`);
  }
  unsubscribeFromComments(tweetId: number): void {
    this.unsubscribe(`/topic/comments/${tweetId}`);
  }

  // === Reacciones de tweets ===
  subscribeToReactions(tweetId: number): Observable<any> {
    console.log(`Suscribiéndose a reacciones del tweet ${tweetId}`);
    return this.subscribe(`/topic/reactions/${tweetId}`);
  }
  unsubscribeFromReactions(tweetId: number): void {
    this.unsubscribe(`/topic/reactions/${tweetId}`);
  }

  // === Reacciones a comentarios ===
  subscribeToCommentReactions(commentId: number): Observable<any> {
    return this.subscribe(`/topic/comment-reactions/${commentId}`);
  }
  unsubscribeFromCommentReactions(commentId: number): void {
    this.unsubscribe(`/topic/comment-reactions/${commentId}`);
  }

  // === Enviar mensajes (si tu backend lo permite) ===
  sendComment(tweetId: number, comment: any): void {
    this.waitForConnection(() => {
      this.stompClient.publish({
        destination: `/app/comments/${tweetId}`,
        body: JSON.stringify(comment),
      });
    });
  }

  sendReaction(tweetId: number, reaction: any): void {
    this.waitForConnection(() => {
      this.stompClient.publish({
        destination: `/app/reactions/${tweetId}`,
        body: JSON.stringify(reaction),
      });
    });
  }

  sendCommentReaction(commentId: number, reaction: any): void {
    this.waitForConnection(() => {
      this.stompClient.publish({
        destination: `/app/comment-reactions/${commentId}`,
        body: JSON.stringify(reaction),
      });
    });
  }
}
