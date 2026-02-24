import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'apifoodie';
  checking = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Hide splash after the FIRST navigation resolves
    // The guard + router handle all auth logic naturally
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      this.checking = false;
    });
  }
}
