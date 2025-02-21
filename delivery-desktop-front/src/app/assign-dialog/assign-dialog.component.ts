import { Component, inject } from '@angular/core';
import { ServicesService } from '../services/services.service';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assign-dialog',
  imports: [FormsModule, DialogModule, ButtonModule],
  templateUrl: './assign-dialog.component.html',
  styleUrl: './assign-dialog.component.css'
})
export class AssignDialogComponent {

  service = inject(ServicesService);
  toastr = inject(ToastrService);

  visible: any;


  assignTaskToEmployee(taskId: string|undefined, userId: string|undefined) {
    this.service.assignTaskToEmployee(taskId, userId).subscribe({
      next: () => {
        this.toastr.success('Task Assigned !', 'Success');
        this.service.visible.set(false);
        this.getAllTasks();
        this.getAllUser();
      },
      error: (err) => {
        this.toastr.error('Error assigning task', 'Error');
        this.service.visible.set(false);
        this.getAllTasks();
        this.getAllUser();
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
        this.toastr.error('Error loading users', 'Error');
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
        this.toastr.error('Error loading tasks', 'Error');
      }
    });
  }

}
