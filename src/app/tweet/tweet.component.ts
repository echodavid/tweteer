import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/webSockets.service';
import { ReactionService } from '../services/reaction.service';
import { Tweet, EReaction } from '../models/tweets/Tweets';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tweet',
  standalone: false,
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.css'],
})
export class TweetComponent implements OnInit, OnDestroy {
  @Input() tweet!: Tweet;
  @Input() reactionTypes: EReaction[] = Object.values(EReaction) as EReaction[];

  private reactionSub?: Subscription;

  constructor(
    private wsService: WebsocketService,
    private reactionService: ReactionService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.tweet) {
      this.subscribeReactions();
    }
  }

  ngOnDestroy() {
    this.reactionSub?.unsubscribe();
    if (this.tweet) this.wsService.unsubscribeFromReactions(this.tweet.id);
  }

  // --- Reacciones a tweets ---
  subscribeReactions() {
    if (!this.tweet) return;
    this.reactionSub = this.wsService
      .subscribeToReactions(this.tweet.id)
      .subscribe((msg) => {
        if (msg.tweetId === this.tweet.id) {
          this.tweet.reactionCounts[msg.reactionType as EReaction] = msg.count;
          if (msg.userReaction !== undefined) {
            this.tweet.userReaction = msg.userReaction;
          }
        }
      });
  }

  shareTweet() {
    if (!this.tweet) return;
    const url = `${window.location.origin}/home(modal:tweet/${this.tweet.id})`;
    if (navigator.share) {
      navigator.share({
        title: 'Mira este tweet',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado!\n' + url);
    }
  }

  onReact(reaction: EReaction) {
    if (!this.tweet) return;
    const reactionId = this.getReactionId(reaction);
    this.reactionService
      .reactToTweet({ tweetId: this.tweet.id, reactionId })
      .subscribe({
        next: () => {
          this.tweet.userReaction = reaction; // Optimista
        },
        error: (err) => {
          alert('Error al reaccionar: ' + err);
        },
      });
  }

  getReactionId(reaction: EReaction): number {
    switch (reaction) {
      case EReaction.REACTION_LIKE:
        return 1;
      case EReaction.REACTION_LOVE:
        return 2;
      case EReaction.REACTION_HATE:
        return 3;
      case EReaction.REACTION_SAD:
        return 4;
      case EReaction.REACTION_ANGRY:
        return 5;
      default:
        return 1;
    }
  }

  getReactionEmoji(reaction: EReaction): string {
    switch (reaction) {
      case EReaction.REACTION_LIKE:
        return '👍';
      case EReaction.REACTION_LOVE:
        return '❤️';
      case EReaction.REACTION_HATE:
        return '💔';
      case EReaction.REACTION_SAD:
        return '😢';
      case EReaction.REACTION_ANGRY:
        return '😡';
      default:
        return '👍';
    }
  }

  openComments() {
    if (!this.tweet) return;
    // Abre el modal de comentarios usando rutas auxiliares
    this.router.navigate(['/', { outlets: { modal: ['tweet', this.tweet.id] } }]);
  }
}
