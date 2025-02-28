
import { Component, inject } from '@angular/core';
import { ServicesService } from '../services/services.service';
import { MessageService } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-livreur-section',
  imports: [],
  templateUrl: './livreur-section.component.html',
  styleUrl: './livreur-section.component.css'
})
export class LivreurSectionComponent {

  service = inject(ServicesService);
  toast = inject(MessageService);

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

}
