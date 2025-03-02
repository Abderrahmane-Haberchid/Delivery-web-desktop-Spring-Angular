import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ServicesService } from '../services/services.service';

@Component({
  selector: 'app-livreur-details',
  imports: [DialogModule, ButtonModule],
  templateUrl: './livreur-details.component.html',
  styleUrl: './livreur-details.component.css'
})
export class LivreurDetailsComponent implements OnInit {

    ngOnInit(): void {
    
    }

    service = inject(ServicesService);
  
  }
