export interface ITask {
    id?: string;
    adresse: string;
    price: number|undefined;
    description: string;
    status: string;
    created_at?: Date;
    updated_at?: Date;
    employeId: string;
}