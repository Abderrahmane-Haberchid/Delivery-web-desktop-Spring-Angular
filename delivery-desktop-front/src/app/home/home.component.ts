import Keycloak from 'keycloak-js';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../services/services.service';
import { ToastrService } from 'ngx-toastr';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AssignDialogComponent } from "../assign-dialog/assign-dialog.component";
import { LivreurListComponent } from "../livreur-list/livreur-list.component";

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FormsModule, DialogModule, ButtonModule, AssignDialogComponent, LivreurListComponent], 
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor() { 
    this.getAllTasks(); 
    this.getAllUser();
    
    if(this.keycloak?.tokenParsed && this.keycloak?.tokenParsed?.resource_access){
      this.userRoles = this.keycloak?.tokenParsed?.resource_access["realm-management"]?.roles;
    }
    this.getUsername();
    this.getEmployeeId();
  }
  ngOnInit(): void {
      console.log(this.keycloak.tokenParsed);
       
  }

showDialog(taskId: string|undefined) {
  this.service.visible.set(true);
  this.service.taskToAssignId.set(taskId);
}

  // Dependecy injection here
  service = inject(ServicesService);
  toastr = inject(ToastrService);
  readonly keycloak = inject(Keycloak);

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
        this.toastr.success('Task Added !', 'Success');
      },
      error: (error) => {
        this.toastr.error('Error saving task', 'Error');
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

  delete(taskId: string|undefined) {
    this.service.deleteTask(taskId).subscribe({
        next: () => {
          this.getAllTasks();
          this.toastr.success('Task Deleted !', 'Success!');
        },
        error: (error) => {
          this.toastr.error('Error deleting task', 'Error');
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
  

  disconnect() {
      this.keycloak.logout();
  }

  taskSwitcherHandler(status: 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED') {
    this.taskSwitcher.set(status);
  }


  unassignTaskFromEmpl(taskId: string|undefined, userId: string|undefined) {
    this.service.unassignTaskFromEmployee(taskId, userId).subscribe({
      next: () => {
        this.toastr.success('Task Unassigned !', 'Success');
        this.service.visible.set(false);
      },
      error: (err) => {
        this.toastr.error('Error unassigning task', 'Error');
        this.service.visible.set(false);
        this.getAllTasks();
        this.getAllUser();
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
        this.toastr.success('Task Completed !', 'Success');
        this.getAllTasks();
      },
      error: (err) => {
        this.toastr.error('Error completing task', 'Error');
        this.getAllTasks();
      }
    });
  }

  markAsUncompletedTask(taskId: string|undefined) {
    this.service.markAsUncompletedTask(taskId).subscribe({
      next: () => {
        this.toastr.success('Task Reassingned to you !', 'Success');
        this.getAllTasks();
      },
      error: (err) => {
        this.toastr.error('Error uncompleting task', 'Error');
        this.getAllTasks();
      }
    });
  }
}