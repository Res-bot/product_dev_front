import { Component, NgModule, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Studentinside } from './student-inside/student-inside.component';
import { Studentoutside } from './student-outside/student-outside';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [CommonModule,FormsModule,Studentinside,Studentoutside],
  standalone: true
})
export class App {
  protected readonly title = signal('student-dashboard');


}

// @NgModule({
//   declarations: [
//     App
//   ],
//   imports: [
//     BrowserModule,
//     FormsModule,
//     CommonModule,
//     RouterModule
//   ],
//   bootstrap: [App]
// })
// export class AppModule {}
