import { Component, inject, signal } from '@angular/core';
import { ServicesService } from '../services/services.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AssignDialogComponent } from "../assign-dialog/assign-dialog.component";

@Component({
  selector: 'app-tasks-modal',
  imports: [FormsModule, DialogModule, ButtonModule, ToastModule, AssignDialogComponent],
  templateUrl: './tasks-modal.component.html',
  styleUrl: './tasks-modal.component.css'
})
export class TasksModalComponent {

  service = inject(ServicesService);
  toast = inject(MessageService);

   // Signals for two-way binding
    adresse = signal<string>('');
    taskDescription = signal<string>('');
    price = signal<number|undefined>(undefined);

    taskSwitcher = signal<'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED'>('UNASSIGNED');

    
    showDialog(taskId: string|undefined) {
      this.service.visible.set(true);
      this.service.taskToAssignId.set(taskId);
    }

    getEmployeById(idEmployee: string) { 
      const user = () => this.service.users().find((user) => user.id === idEmployee);
      return user ? user()?.username : ''; 
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

    saveTask() {
      this.service.task.set({
        adresse: this.adresse(),
        price: this.price(),
        description: this.taskDescription(),
        status: 'UNASSIGNED',
        employeId: ''
      });
  
      this.service.saveTask(this.service.task()).subscribe({
        next: () => {
          this.getAllTasks(); 
          this.adresse.set(''); 
          this.price.set(0);
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
          let total:number = 0;
          // Here we calculte total amount for completed commande only
          this.service.tasksCompleted().map((task) => total += task?.price || 0)
          this.service.totalAmount.set(total);
  
          let totalLivreur:number = 0;
          // Here we calculte the total amount commande per delivery guy
          this.service.employeeCompletedTasks().map((task) => totalLivreur+= task?.price || 0);
          this.service.totalAmountLivreur.set(totalLivreur);
  
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

}
