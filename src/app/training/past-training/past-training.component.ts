import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { Exercise } from '../exercise.module';
import { TrainingService } from '../training.service';
import { Store } from '@ngrx/store';

import * as fromTraining from '../training.reducer';
import { YesNoDialogComponent } from 'src/app/shared/yes.no.dialog.component';

@Component({
  selector: 'app-past-training',
  templateUrl: './past-training.component.html',
  styleUrls: ['./past-training.component.scss']
})
export class PastTrainingComponent implements OnInit, AfterViewInit {
  displayedColumns = ['date', 'name', 'duration', 'calories', 'state', 'actions'];
  dataSource = new MatTableDataSource<Exercise>();

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  constructor(private trainingService: TrainingService, private dialog: MatDialog, private store: Store<fromTraining.State>) { }

  ngOnInit() {
    this.trainingService.fetchCompletedOrCancelledExercises();
    this.store.select(fromTraining.getFinishedExercises)
    .subscribe((ex: Exercise[]) => {
      this.dataSource.data = ex;
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  doFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onDelete(ex: Exercise) {
    
    const dialogRef = this.dialog.open(YesNoDialogComponent, { data: { message: "Are you sure you want to delete this exercise from your history?", title: "Are you sure?" } });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trainingService.deleteExercise(ex.id);
      }
    });

  }
}
