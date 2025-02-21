import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ServicesService } from "../services/services.service";
import { ToastrService } from "ngx-toastr";




@Component({
  standalone: true,
  selector: 'app-livreur-list',
  imports: [FormsModule, DialogModule, ButtonModule],
  templateUrl: './livreur-list.component.html',
  styleUrl: './livreur-list.component.css'
})
export class LivreurListComponent implements OnInit {
  ngOnInit(): void {
    }

  service = inject(ServicesService);
  toastr = inject(ToastrService);  


  }
