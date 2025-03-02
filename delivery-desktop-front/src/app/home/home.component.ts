
import Keycloak from 'keycloak-js';
import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../services/services.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { LivreurListComponent } from "../livreur-list/livreur-list.component";
import { ToastModule } from 'primeng/toast';
import { LivreurDetailsComponent } from "../livreur-details/livreur-details.component";
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { TasksModalComponent } from "../tasks-modal/tasks-modal.component";
import { LivreurSectionComponent } from "../livreur-section/livreur-section.component";
import * as L from 'leaflet';


@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FormsModule, DialogModule, ButtonModule, LivreurListComponent, ToastModule, LivreurDetailsComponent, TasksModalComponent, LivreurSectionComponent], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [MessageService]
})
export class HomeComponent implements OnInit, AfterViewInit {


   // Dependecy injection here
   service = inject(ServicesService);
   toast = inject(MessageService);
   readonly keycloak = inject(Keycloak);

   private map: L.Map | undefined;
   private userMarker: L.Marker | undefined;

   userRoles: string[] = [];

   stompClient: any;
   rootUrl: string = "http://localhost:8081";

    ngOnInit(): void {
      
      this.connectSocket();

        this.getAllTasks(); 
        this.getAllUser();
      

        if(this.keycloak?.tokenParsed && this.keycloak?.tokenParsed?.resource_access){
          this.userRoles = this.keycloak?.tokenParsed?.resource_access["realm-management"]?.roles;
        }
        this.getUsername();
        this.getEmployeeId();
  }

  ngAfterViewInit(): void{
      this.initMap();
      this.trackUserLocation();
  }

  connectSocket() {
    try {
      if(this.keycloak.tokenParsed?.sub){
        const socket = new SockJS(`${this.rootUrl}/socket-task`); // connecting socket
        this.stompClient = Stomp.over(socket); // connecting Stomp over socket
        this.stompClient.connect({}, () => { // Loginv after connection opened

          this.stompClient.subscribe("/topic/assigned-task", (message: any) => {
            if(message.body !== ''){
                this.getAllTasks();
                this.getAllUser();
            }
          });

        });

        this.stompClient.debug = (msg: string) => {
          console.debug('STOMP Debug:', msg);
        };
      }
      
    } catch (err) {
      console.error('An error occurred while connecting:', err);
    }
  }


  async getUsername(){
    const userInfo: { preferred_username?: string } = await this.keycloak.loadUserInfo();
    this.service.userName.set(userInfo.preferred_username || ''); 
   } 
   

  // Operations start here

  getAllTasks() {
    
    this.service.getAllTasks()
      .subscribe({
        next: (data) => {
          // Here i filtre all tasks by date only if user pick date
          this.service.tasksUnassigned.set(data.filter((task) => task.status === 'UNASSIGNED'));
          this.service.tasksAssigned.set(data.filter((task) => task.status === 'ASSIGNED'));
          this.service.tasksCompleted.set(data.filter((task) => task.status === 'COMPLETED'));
          
          // List of tasks assigned to the current employee
          this.service.employeeAssignedTasks.set(
                    this.service.tasksAssigned()
                            .filter((task) =>  
                              task.employeId === this.service.employeeId() && task.status === 'ASSIGNED'
                            )
          ); 
          // List of tasks completed by the current employee
          this.service.employeeCompletedTasks.set(
                    this.service.tasksCompleted()
                            .filter((task) =>  
                              task.employeId === this.service.employeeId() && task.status === 'COMPLETED'
                            )
          );
          // let total:number = 0;
          // // Here we calculte total amount for completed commande only
          // this.service.tasksCompletedFiltred().map((task) => total += task?.price || 0)
          // this.service.totalAmount.set(total);
  
          // let totalLivreur:number = 0;
          // // Here we calculte the total amount commande per delivery guy
          // this.service.employeeCompletedTasks().map((task) => totalLivreur+= task?.price || 0);
          // this.service.totalAmountLivreur.set(totalLivreur);

      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Pas possible de charger les commandes !'
        })
      }
    });
    
  }

  getAllUser(){
    this.service.getUsers().subscribe({
      next: (data) => {
        this.service.users.set(data);

        this.service.usersFree.set(data.filter((user:any) => {
          const taskid = user?.attributes?.taskid;
          return !taskid || taskid.length === 0;
        }));
        this.service.usersOccupied.set(data.filter((user:any) => {
          const taskid = user?.attributes?.taskid;
          return taskid && taskid.length > 0;
        }));
        
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Pas possible de charger les livreurs, merci de réessayer !'
        })
      }
    });
  }

  disconnect() {
      this.keycloak.logout();
  }

  getEmployeeId() {
    const token = this.keycloak.tokenParsed;
    this.service.employeeId.set(token?.sub);
  }

  private initMap(): void {
    // Initialize the map with a default view
    this.map = L.map('map').setView([0, 0], 13);

    // Add a tile layer (e.g., OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private trackUserLocation(): void {
    if ('geolocation' in navigator) {
      // tracking user position on real time
      navigator.geolocation.watchPosition(
        (position) => this.updateUserLocation(position),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  private updateUserLocation(position: GeolocationPosition): void {
    const { latitude, longitude } = position.coords;

    if (this.userMarker) {
      // Update the marker's position
      this.userMarker.setLatLng([latitude, longitude]);
    } else {
      // Create a new marker for the user
      this.userMarker = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: '../../assets/icons/truck.png', 
          iconSize: [60, 60],
          iconAnchor: [12, 25]
        })
      }).addTo(this.map!)
        //.bindPopup('You are here')
        .openPopup();
    }

    // Center the map on the user's location
    this.map?.setView([latitude, longitude], 13);
  }
}