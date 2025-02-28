
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ITask } from '../interfaces/ITask';
import { IUser } from '../interfaces/IUser';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  private http = inject(HttpClient);

  BASE_URL: string = 'http://localhost:8081/api/v1/task';
  BASE_URL_USERS: string = 'http://localhost:8081/api/v1/users';

    // tasks signals
    tasksUnassigned = signal<ITask[]>([]);
    tasksAssigned = signal<ITask[]>([]);
    tasksCompleted = signal<ITask[]>([]);

    // Total command amount
    totalAmount = signal<number|undefined>(0);

    // Total commande amour per delivery guy
    totalAmountLivreur = signal<number|undefined>(0);

    task = signal<ITask>({
      adresse: '',
      price: 0,
      description: '',
      status: '',
      employeId: ''
    });

    // user/employee signals
    users = signal<IUser[]>([]);
    usersFree = signal<IUser[]>([]);
    usersOccupied = signal<IUser[]>([]);
    userName = signal<string>('');
    employeeId = signal<string | undefined>('');

    employeeAssignedTasks = signal<ITask[]>([]);
    employeeCompletedTasks = signal<ITask[]>([]);

    // showing dialog to assign task
    visible = signal<boolean>(false);
    // showing delivery guy details dialog
    showUserDialog = signal<boolean>(false);

    taskToAssignId = signal<string|undefined>('') ;
    


  saveTask(task: ITask): Observable<ITask>{
    return this.http.post<ITask>(`${this.BASE_URL+'/save'}`, task);
  }

    getAllTasks(): Observable<ITask[]>{
      return this.http.get<ITask[]>(`${this.BASE_URL+'/all'}`);
    }

    deleteTask(id: string|undefined): Observable<any>{
      return this.http.delete(`${this.BASE_URL+'/delete/'+id}`);
    }

    getUsers(): Observable<IUser[]>{
      return this.http.get<IUser[]>(`${this.BASE_URL_USERS+'/all'}`);
    }

    assignTaskToEmployee(taskId: string | undefined, userId: string | undefined): Observable<any> {
      return this.http.put<any>(`${this.BASE_URL+'/assign/'+taskId+'/'+userId}`, null);
    }

    unassignTaskFromEmployee(taskId: string | undefined, userId: string | undefined): Observable<any> {
      return this.http.put<any>(`${this.BASE_URL+'/unassign/'+taskId+'/'+userId}`, null);
    }

    markAsCompletedTask(taskId: string | undefined): Observable<any> {
      return this.http.put<any>(`${this.BASE_URL+'/markAsCompleted/'+taskId}`, null);
    }

    markAsUncompletedTask(taskId: string | undefined): Observable<any> {
      return this.http.put<any>(`${this.BASE_URL+'/markAsUnCompleted/'+taskId}`, null);
    }

}
