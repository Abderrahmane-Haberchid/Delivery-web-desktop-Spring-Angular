import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ServicesService } from "../services/services.service";
import { ToastModule } from 'primeng/toast';
import { MessageService } from "primeng/api";


@Component({
  standalone: true,
  selector: 'app-livreur-list',
  imports: [FormsModule, DialogModule, ButtonModule, ToastModule],
  templateUrl: './livreur-list.component.html',
  styleUrl: './livreur-list.component.css',
  providers: [MessageService]
})
export class LivreurListComponent implements OnInit {
  ngOnInit(): void {
    }

  service = inject(ServicesService); 


  }
