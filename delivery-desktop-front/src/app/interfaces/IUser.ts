export interface IUser{
    id: string;
    username: string;
    email: string;
    role: string;
    attributes?: {
        taskid?: string[]; 
      };
    
}