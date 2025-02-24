import { Status } from './../../../node_modules/@inquirer/core/dist/commonjs/lib/theme.d';
import { Component, inject } from '@angular/core';
import { ServicesService } from '../services/services.service';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-assign-dialog',
  imports: [FormsModule, DialogModule, ButtonModule, ToastModule],
  templateUrl: './assign-dialog.component.html',
  styleUrl: './assign-dialog.component.css',
  providers: [MessageService]
})
export class AssignDialogComponent {

  service = inject(ServicesService);
  toast = inject(MessageService);

  visible: any;


  assignTaskToEmployee(taskId: string|undefined, userId: string|undefined) {
    this.service.assignTaskToEmployee(taskId, userId).subscribe({
      next: (res) => {
        this.toast.add({
          severity: 'success',
          summary: 'Succes',
          detail: 'Commande assignée !'
        })
        this.service.visible.set(false);
        this.getAllTasks();
        this.getAllUser();
        
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
          detail: 'Pas possible de charger les livreurs, merci de réessayer!'
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
          detail: 'Pas possible de charger les commandes, merci de réessayer!'
        })
      }
    });
  }

}
