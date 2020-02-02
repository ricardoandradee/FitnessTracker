import { Exercise } from './exercise.module';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as fromTraining from '../training/training.reducer';
import * as UI from '../shared/ui.actions';
import * as Training from '../training/training.actions';

@Injectable()
export class TrainingService {
    private fbSubs: Subscription[] = [];

    constructor(private db: AngularFirestore, private store: Store<fromTraining.State>) {
    }

    fetchAvailableExercises() {
        this.store.dispatch(new UI.StartLoading());
        this.fbSubs.push(this.db.collection('AvailableExercises')
            .snapshotChanges()
            .pipe(map(docArray => {
            return docArray.map(doc => {
                return {
                id: doc.payload.doc.id,
                name: doc.payload.doc.data()['name'],
                duration: doc.payload.doc.data()['duration'],
                calories: doc.payload.doc.data()['calories']
                };
            });
            })).subscribe((ex: Exercise[]) => {
                this.store.dispatch(new UI.StopLoading());
                this.store.dispatch(new Training.SetAvailableTrainings(ex));
            }));
    }

    startExercise(selectedId: string) {
        this.store.dispatch(new Training.StartTrainings(selectedId));
    }

    completeExercise() {
        this.store.select(fromTraining.getActiveExercise).pipe(take(1)).subscribe(ex => {
            this.addDataToDataBase({
                exerciseId: ex.id,
                name: ex.name,
                date: new Date(),
                state: 'completed',
                duration: ex.duration,
                calories: ex.calories
            });
            this.store.dispatch(new Training.StopTrainings());
        });
    }

    cancelExercise(progress: number) {
        this.store.select(fromTraining.getActiveExercise).pipe(take(1)).subscribe(ex => {
            this.addDataToDataBase({
                    exerciseId: ex.id,
                    name: ex.name,
                    date: new Date(),
                    state: 'cancelled',
                    duration: ex.duration * (progress / 100),
                    calories: ex.calories * (progress / 100)
                });
        });

        this.store.dispatch(new Training.StopTrainings());
    }

    fetchCompletedOrCancelledExercises() {
        this.store.dispatch(new UI.StartLoading());
        this.fbSubs.push(this.db.collection('FinishedExercises')
        .snapshotChanges()
        .pipe(map(docArray => {
        return docArray.map(doc => {
            return {
                id: doc.payload.doc.id,
                calories: doc.payload.doc.data()['calories'],
                date: doc.payload.doc.data()['date'],
                duration: doc.payload.doc.data()['duration'],
                exerciseId: doc.payload.doc.data()['exerciseId'],
                name: doc.payload.doc.data()['name'],
                state: doc.payload.doc.data()['state']
            };
        });
        })).subscribe((ex: Exercise[]) => {
            this.store.dispatch(new Training.SetFinishedTrainings(ex));
        }));
    }

    cancelSubscriptions() {
        this.fbSubs.forEach(i => { i.unsubscribe()});
    }

    private addDataToDataBase(exercise: Exercise) {
        this.db.collection('FinishedExercises')
        .add(exercise);
    }
    
    deleteExercise(exId: string) {
        this.db.collection('FinishedExercises').doc(exId).delete();
    }
}