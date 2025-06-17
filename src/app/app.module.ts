import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { UserService } from './services/user.service';
import { NewUserComponent } from './new-user/new-user.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { WebsocketService } from './services/webSockets.service';
import { TweetComponent } from './tweet/tweet.component';
import { TweetModalComponent } from './tweet-modal/TweetModalComponent';

@NgModule({
  declarations: [
    AppComponent,

    LoginComponent,
    NewUserComponent,
    ForgotPasswordComponent,
    HomeComponent,
    TweetComponent,
    TweetModalComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [UserService, HttpClient, WebsocketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
