import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TweetService } from '../services/tweet.service';
import { CommentService } from '../services/comment.service';
import { WebsocketService } from '../services/webSockets.service';
import { ReactionRequest, ReactionService } from '../services/reaction.service';
import { Tweet, EReaction } from '../models/tweets/Tweets';
import { CommentRequest } from '../models/tweets/CommentRequest';
import { CommentResponse } from '../models/tweets/CommentResponse';
import { CommentNotificationMessage } from '../models/tweets/CommentNotification';

@Component({
  selector: 'app-tweet-modal',
  templateUrl: './tweet-modal.component.html',
  standalone: false,
  styleUrls: ['./tweet-modal.component.css'],
})
export class TweetModalComponent implements OnInit, OnDestroy {
  tweet?: Tweet;
  tweetId!: number;
  reactionTypes: EReaction[] = Object.values(EReaction) as EReaction[];
  comments: CommentNotificationMessage[] = [];
  newComment: string = '';
  isOpen = true;
  loading = false;

  private reactionSub?: Subscription;
  private commentSub?: Subscription;
  private commentReactionSubs: { [commentId: number]: Subscription } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tweetService: TweetService,
    private commentService: CommentService,
    private wsService: WebsocketService,
    private reactionService: ReactionService
  ) {}

  ngOnInit() {
    this.tweetId = +this.route.snapshot.params['id'];
    console.log('Suscribiendo a comentarios para elkkkk tweet:', this.tweetId);
    this.tweetService.getTweetById(this.tweetId).subscribe({
      next: (tweet) => {
        this.tweet = tweet;
        console.log('Tweet cargado:', this.tweet);
        this.subscribeToComments();
        this.subscribeReactions();
        console.log('Suscribiendo a reacciones para el tweet:', this.tweet.id);
      },
    });
  }

  ngOnDestroy() {
    this.reactionSub?.unsubscribe();
    if (this.tweet) this.wsService.unsubscribeFromReactions(this.tweet.id);
    this.commentSub?.unsubscribe();
    if (this.tweet) this.wsService.unsubscribeFromComments(this.tweet.id);
    // Desuscribir de todas las reacciones a comentarios
    Object.values(this.commentReactionSubs).forEach(sub => sub.unsubscribe());
    this.commentReactionSubs = {};
  }

  // --- Reacciones a tweets ---
   subscribeReactions() {
    if (!this.tweet) return;
    this.reactionSub = this.wsService
      .subscribeToReactions(this.tweet.id)
      .subscribe((msg) => {
        if (msg.tweetId === this.tweet!.id) {
          this.tweet!.reactionCounts[msg.reactionType as EReaction] = msg.count;
          if (msg.userReaction !== undefined) {
            this.tweet!.userReaction = msg.userReaction;
          }
        }
      });
  }
onReact(reaction: EReaction) {
  if (!this.tweet) return;
  const reactionId = this.getReactionId(reaction);
  const prevReaction = this.tweet.userReaction;

  this.reactionService.reactToTweet({ tweetId: this.tweet.id, reactionId }).subscribe({
    next: () => {
      // Actualización optimista del contador
      if (prevReaction && prevReaction !== reaction) {
        this.tweet!.reactionCounts[prevReaction] = Math.max((this.tweet!.reactionCounts[prevReaction] || 1) - 1, 0);
      }
      this.tweet!.reactionCounts[reaction] = (this.tweet!.reactionCounts[reaction] || 0) + 1;
      this.tweet!.userReaction = reaction;
    },
    error: (err) => {
      alert('Error al reaccionar: ' + err);
    },
  });
}
  getReactionId(reaction: EReaction): number {
    switch (reaction) {
      case EReaction.REACTION_LIKE: return 1;
      case EReaction.REACTION_LOVE: return 2;
      case EReaction.REACTION_HATE: return 3;
      case EReaction.REACTION_SAD: return 4;
      case EReaction.REACTION_ANGRY: return 5;
      default: return 1;
    }
  }

  getTopReaction(): EReaction {
    if (!this.tweet) return EReaction.REACTION_LIKE;
    let max = -1;
    let top: EReaction = EReaction.REACTION_LIKE;
    for (const reaction of this.reactionTypes) {
      const count = this.tweet.reactionCounts[reaction] || 0;
      if (count > max) {
        max = count;
        top = reaction;
      }
    }
    return top;
  }

  getReactionEmoji(reaction: EReaction): string {
    switch (reaction) {
      case EReaction.REACTION_LIKE: return '👍';
      case EReaction.REACTION_LOVE: return '❤️';
      case EReaction.REACTION_HATE: return '💔';
      case EReaction.REACTION_SAD: return '😢';
      case EReaction.REACTION_ANGRY: return '😡';
      default: return '👍';
    }
  }

  // --- Comentarios ---
  subscribeToComments() {
    console.log('Suscribiendo a comentarios para el tweet:', this.tweetId);
    if (!this.tweet) return;
    this.comments = [];
    this.commentService.getCommentsByTweet(this.tweet.id).subscribe({
      next: (comments: CommentResponse[]) => {
        console.log('Comentarios lvlvlvl:', comments);
        this.comments = comments.map((c) => ({
          id: c.id,
          tweetId: this.tweet!.id,
          content: c.content,
          username: c.username,
          createdAt: c.createdAt,
        }));
        // Suscribirse a reacciones de cada comentario
        this.comments.forEach(comment => this.subscribeToCommentReactions(comment.id));
      },
      error: () => {
        console.log('Error al obtener comentarios');
        this.comments = [];
      },
      complete: () => {
        this.commentSub = this.wsService
          .subscribeToComments(this.tweet!.id)
          .subscribe((msg: CommentNotificationMessage) => {
            console.log('Nuevo comentario recibido:', msg);
            if (msg.tweetId === this.tweet!.id) {
              this.comments.push(msg);
              // Suscribirse a reacciones del nuevo comentario
              this.subscribeToCommentReactions(msg.id);
            }
          });
      },
    });
  }

  // --- Reacciones a comentarios ---
  subscribeToCommentReactions(commentId: number) {
    if (this.commentReactionSubs[commentId]) return; // Ya suscrito
    this.commentReactionSubs[commentId] = this.wsService
      .subscribeToCommentReactions(commentId)
      .subscribe((msg) => {
        console.log('Reacción a comentario recibida:', msg);
        // Aquí puedes actualizar la UI de reacciones del comentario correspondiente
        // Ejemplo: buscar el comentario y actualizar su conteo de reacciones
        // (Depende de cómo manejes la estructura de comentarios y reacciones)
      });
  }

  close() {
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  submitComment() {
    if (!this.newComment.trim() || !this.tweet) return;
    const request: CommentRequest = {
      tweetId: this.tweet.id,
      content: this.newComment.trim(),
    };
    this.commentService.createComment(request).subscribe({
      next: () => {
        this.newComment = '';
        // El comentario llegará en tiempo real por WebSocket
      },
      error: (err) => {
        alert('Error al comentar: ' + err);
      },
    });
  }
}
