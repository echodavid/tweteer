import { Component } from '@angular/core';
import { StorageService } from "../services/storage.service";
import { TweetService } from '../services/tweet.service';
import { EReaction, Tweet } from '../models/tweets/Tweets';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: false,
})
export class HomeComponent {
  reactionTypes: EReaction[] = Object.values(EReaction);
  username: string = '';
  tweetText: string = '';
  tweets: Tweet[] = [];
  constructor(
    private router: Router,
    private userService: UserService,
    private storageService: StorageService,
    private tweetService: TweetService
  ) {
    this.username = this.storageService.getSession('user');
    console.log(this.username);
    this.getTweets();
  }

  menuOpen = false;

  // Method to toggle the menu open/close
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Method to explicitly close the menu (useful for navigation)
  closeMenu() {
    this.menuOpen = false;
  }

  // Method to explicitly open the menu (if needed)
  openMenu() {
    this.menuOpen = true;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
  private getTweets() {
    console.log('Fetching tweets...');
    this.tweetService.getTweets().subscribe((tweets: any) => {
      this.tweets = tweets;
      console.log(this.tweets);
    });
  }

  public addTweet() {
    this.tweetService.postTweet(this.tweetText).subscribe((tweet: any) => {
      console.log(tweet);
      this.tweetText = '';
      this.getTweets();
    });
  }
}
