
import Keycloak from 'keycloak-js';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../services/services.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AssignDialogComponent } from "../assign-dialog/assign-dialog.component";
import { LivreurListComponent } from "../livreur-list/livreur-list.component";
import { ToastModule } from 'primeng/toast';
import { interval, Subscription } from 'rxjs';
import { LivreurDetailsComponent } from "../livreur-details/livreur-details.component";
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FormsModule, DialogModule, ButtonModule, AssignDialogComponent, LivreurListComponent, ToastModule, LivreurDetailsComponent], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [MessageService]
})
export class HomeComponent implements OnInit {


   // Dependecy injection here
   service = inject(ServicesService);
   toast = inject(MessageService);
   readonly keycloak = inject(Keycloak);

   private subscription: Subscription | undefined;

   stompClient: any;
    rootUrl: string = "http://localhost:8081";

    ngOnInit(): void {

      console.log("connecttion will start now");

      // this.subscription = interval(1000).subscribe({
      //   next: () => {
      //     this.getAllTasks();
      //     this.getAllUser();
      //   }

      // })
      
      this.connectSocket();

      this.getAllTasks(); 
        this.getAllUser();
        
        if(this.keycloak?.tokenParsed && this.keycloak?.tokenParsed?.resource_access){
          this.userRoles = this.keycloak?.tokenParsed?.resource_access["realm-management"]?.roles;
        }
        this.getUsername();
        this.getEmployeeId();
       
  }

  connectSocket() {
    try {
      if(this.keycloak.tokenParsed?.sub){
        
        const socket = new SockJS('http://localhost:8081/socket-task');

        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({'Authorization': `Bearer ${this.keycloak.tokenParsed?.sub}`}, () => {
          console.log('Connected to WebSocket');

          this.stompClient.subscribe("/topic/assigned-task", (message: any) => {
            console.log('==========> An Update received from backend', message.body);
            this.getAllTasks();
            this.getAllUser();
          });

        //   this.stompClient.send('/app/test-msg',
        //     JSON.stringify({ msg: 'this is a msg from front via socket', action: 'connected' }));
        // }, (error: any) => {
        //   console.error('Error connecting to WebSocket:', error);
        });

        this.stompClient.debug = (msg: string) => {
          console.debug('STOMP Debug:', msg);
        };
      }
      
    } catch (err) {
      console.error('An error occurred while connecting:', err);
    }
  }
  

showDialog(taskId: string|undefined) {
  this.service.visible.set(true);
  this.service.taskToAssignId.set(taskId);
}

  // Signals for two-way binding
  taskTitle = signal<string>('');
  taskDescription = signal<string>('Description from test');


  userRoles: string[] = [];

  taskSwitcher = signal<'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED'>('UNASSIGNED');

  async getUsername(){
    const userInfo: { preferred_username?: string } = await this.keycloak.loadUserInfo();
    this.service.userName.set(userInfo.preferred_username || ''); 
   } 
   

  // Operations start here

   getEmployeById(idEmployee: string) { 
    const user = () => this.service.users().find((user) => user.id === idEmployee);
    return user ? user()?.username : ''; 
   }

  saveTask() {
    this.service.task.set({
      title: this.taskTitle(),
      description: this.taskDescription(),
      status: 'UNASSIGNED',
      employeId: ''
    });

    this.service.saveTask(this.service.task()).subscribe({
      next: () => {
        this.getAllTasks(); 
        this.taskTitle.set(''); 
        this.taskDescription.set('');
        this.toast.add({
          severity: 'success',
          summary: 'Info',
          detail: 'Commande Ajouté !'
        })
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Problème generé lors la connexion au base de donnée !'
        })
      }
    });
  }

  getAllTasks() {
    this.service.getAllTasks().subscribe({
      next: (data) => {
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

  delete(taskId: string|undefined) {
    this.service.deleteTask(taskId).subscribe({
        next: () => {
          this.getAllTasks();
          this.toast.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Commande Supprimée !'
          })
        },
        error: () => {
          this.toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Pas possible supprimer la commande, merci de réessayer !'
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

  taskSwitcherHandler(status: 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED') {
    this.taskSwitcher.set(status);
  }


  unassignTaskFromEmpl(taskId: string|undefined, userId: string|undefined) {
    this.service.unassignTaskFromEmployee(taskId, userId).subscribe({
      next: () => {
          this.getAllTasks();
          this.getAllUser();
          this.service.visible.set(false);
          this.toast.add({
            severity: 'success',
            summary: 'Info',
            detail: 'Commande déassigné avec succes !'
          })
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Pas possible d'annuler l'assignement, merci de réessayer !"
        });
        }
    });
  }

  getEmployeeId() {
    const token = this.keycloak.tokenParsed;
    this.service.employeeId.set(token?.sub);
  }

  markAsCompletedTask(taskId: string|undefined) {
    this.service.markAsCompletedTask(taskId).subscribe({
      next: () => {
        this.toast.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Commande Livrée !'
        })
        this.getAllTasks();
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Merci de réessayer plus tard !'
        })
      }
    });
  }

  markAsUncompletedTask(taskId: string|undefined) {
    this.service.markAsUncompletedTask(taskId).subscribe({
      next: () => {
        this.toast.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Commande vous a été réassigné !'
        })
        this.getAllTasks();
      },
      error: () => {
        this.toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Merci de réessayer plus tard !'
        })
      }
    });
  }

  ngOnDestroy(){
    this.subscription?.unsubscribe();
  }
}