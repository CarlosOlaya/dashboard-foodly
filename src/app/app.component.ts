import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'apifoodie';
  checking = true;

  constructor(
    private router: Router,
    private swUpdate: SwUpdate,
  ) { }

  ngOnInit(): void {
    // Hide splash after the FIRST navigation resolves
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      this.checking = false;
    });

    // Auto-update: when a new version is deployed, reload automatically
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter(event => event.type === 'VERSION_READY')
      ).subscribe(() => {
        document.location.reload();
      });
    }
  }
}
