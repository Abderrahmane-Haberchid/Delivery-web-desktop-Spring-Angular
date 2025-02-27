import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ServicesService } from '../services/services.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-livreur-details',
  imports: [DialogModule, ButtonModule],
  templateUrl: './livreur-details.component.html',
  styleUrl: './livreur-details.component.css'
})
export class LivreurDetailsComponent implements OnInit, AfterViewInit {

    ngOnInit(): void {
    
    }
    ngAfterViewInit(): void{
    this.initMap();
    }

    service = inject(ServicesService);

     map: any;

     initMap(): void {

       this.map = L.map('map', {
        center: [51.505, -0.09],
        zoom: 6
       });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // L.marker([51.5, -0.09]).addTo(this.map)
        //     .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        //     .openPopup();
    }
  
  }
