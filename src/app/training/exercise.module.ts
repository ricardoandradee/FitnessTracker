export interface Exercise {
    id?: string;
    exerciseId?: string;
    name: string;
    duration: number;
    calories: number;
    date?: Date;
    state?: 'completed' | 'cancelled' | null;
}