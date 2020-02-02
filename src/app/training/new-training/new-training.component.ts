import { Component, OnInit } from '@angular/core';
import { Exercise } from '../exercise.module';
import { TrainingService } from '../training.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from 'src/app/app.reducer';
import * as fromTraining from 'src/app/training/training.reducer';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit {
  isLoading$: Observable<boolean>;
  excercises$: Observable<Exercise[]>;
  constructor(private trainingService: TrainingService, private store: Store<fromTraining.State>) { }

  ngOnInit() {
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.excercises$ = this.store.select(fromTraining.getAvailableExercises);
    this.onFetchExercises();
  }

  onFetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }
  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }
}
