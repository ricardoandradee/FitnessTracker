import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';
import { TrainingService } from '../training/training.service';
import { UiService } from '../shared/ui.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import * as Auth from './auth.actions';

@Injectable()
export class AuthService {
    private user: User;

    constructor(private router: Router, private afAuth: AngularFireAuth,
                private trainingService: TrainingService,
                private uiService: UiService, private store: Store<{ui: fromRoot.State}>) { }

    initAuthListener() {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.store.dispatch(new Auth.SetAuthenticated());
                this.router.navigate(['/training']);
            } else {
                this.trainingService.cancelSubscriptions();
                this.store.dispatch(new Auth.SetUnauthenticated());
                this.router.navigate(['/login']);
            }
        });
    }

    registerUser(authData: AuthData) {
        this.store.dispatch(new UI.StartLoading());
        this.afAuth.auth
        .createUserWithEmailAndPassword(authData.email, authData.password)
        .then(authResult => {
            this.store.dispatch(new UI.StopLoading());
            console.log(authResult);
        }).catch(error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackBar(error.message, 3000, null);
        });
    }

    login(authData: AuthData) {
            this.store.dispatch(new UI.StartLoading());
            this.afAuth.auth
        .signInWithEmailAndPassword(authData.email, authData.password)
        .then(authResult => {
            this.store.dispatch(new UI.StopLoading());
            console.log(authResult);
        }).catch(error => {
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackBar(error.message, 3000, null);
        });
    }

    logout() {
        this.afAuth.auth.signOut();
    }

    getUser() {
        return { ...this.user };
    }
}
