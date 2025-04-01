import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Application Settings Management';
  currentYear: number;
  
  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    // Any initialization logic
  }
}