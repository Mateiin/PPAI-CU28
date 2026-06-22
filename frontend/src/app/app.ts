import { Component } from '@angular/core';
import { PantallaRegRecepcionComponent } from './recepcion-bolsin/pantalla-reg-recepcion/pantalla-reg-recepcion.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PantallaRegRecepcionComponent],
  template: '<app-pantalla-reg-recepcion />',
})
export class App {}
