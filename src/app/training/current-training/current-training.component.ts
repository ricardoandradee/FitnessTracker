import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TrainingService } from '../training.service';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as fromTraining from '../training.reducer';
import { YesNoDialogComponent } from 'src/app/shared/yes.no.dialog.component';

@Component({
  selector: 'app-current-training',
  templateUrl: './current-training.component.html',
  styleUrls: ['./current-training.component.scss']
})
export class CurrentTrainingComponent implements OnInit {
  progress = 0;
  timer: number;
  constructor(private dialog: MatDialog, private trainingService: TrainingService, private store: Store<fromTraining.State>) { }

  ngOnInit() {
    this.onStartOrResumeTimer();
  }

  onStartOrResumeTimer() {
    this.store.select(fromTraining.getActiveExercise).pipe(take(1)).subscribe(exercise => {
      const step = exercise.duration / 100 * 1000;
      this.timer = setInterval(() => {
        this.progress = this.progress + 1;
        if (this.progress >= 100) {
          this.trainingService.completeExercise();
          clearInterval(this.timer);
        }
      }, step);

    });
  }

  onStop() {
    clearInterval(this.timer);
    const dialogRef = this.dialog.open(YesNoDialogComponent, { data: { message: "You already got " + this.progress + "%", title: "Are you sure?" } });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trainingService.cancelExercise(this.progress);
      } else {
        this.onStartOrResumeTimer();
      }
    });
  }
}
