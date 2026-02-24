import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '../../services/platform.service';
import { switchMap } from 'rxjs';
import { Plato } from '../../../auth/interfaces/interfaces';

@Component({
  selector: 'app-plato',
  templateUrl: './plato.component.html',
  styleUrls: ['./plato.component.css']
})
export class PlatoComponent implements OnInit {

  plato!: Plato;

  constructor(
    private activateRoute: ActivatedRoute,
    private platformService: PlatformService
  ) { }

  ngOnInit(): void {
    this.activateRoute.params
      .pipe(
        switchMap(({ id }) => this.platformService.getPlato(id))
      )
      .subscribe(plato => this.plato = plato);
  }
}
