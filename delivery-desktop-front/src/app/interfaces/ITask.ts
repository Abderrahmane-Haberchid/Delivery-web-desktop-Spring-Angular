export interface ITask {
    id?: string;
    title: string;
    description: string;
    status: string;
    created_at?: Date;
    updated_at?: Date;
    employeId: string;
}