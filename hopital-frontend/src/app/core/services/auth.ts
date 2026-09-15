import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  tap
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private http =
    inject(HttpClient);


  private apiUrl =
    'http://127.0.0.1:8080/api';


  // =========================
  // LOGIN
  // =========================

  login(
    credentials: {
      username: string;
      password: string;
    }
  ):
    Observable<any> {


    return this.http.post<any>(

      `${this.apiUrl}/login/`,

      credentials

    ).pipe(


      tap(
        (res) => {


          console.log(
            'LOGIN RESPONSE =',
            res
          );


          // =========================
          // TOKEN
          // =========================

          if (res.token) {

            localStorage.setItem(
              'token',
              res.token
            );

          }


          // =========================
          // ROLE
          // =========================

          if (res.role) {

            const role =
              String(res.role)
                .trim()
                .toUpperCase();


            localStorage.setItem(
              'role',
              role
            );

          }


          // =========================
          // USERNAME
          // =========================

          if (res.username) {

            localStorage.setItem(
              'username',
              res.username
            );

          }


          console.log(
            'TOKEN STOCKÉ =',
            localStorage.getItem(
              'token'
            )
          );


          console.log(
            'ROLE STOCKÉ =',
            localStorage.getItem(
              'role'
            )
          );


        }

      )

    );

  }


  // =========================
  // TOKEN
  // =========================

  getToken():
    string | null {

    return localStorage.getItem(
      'token'
    );

  }


  // =========================
  // ROLE
  // =========================

  getUserRole():
    string | null {

    const role =
      localStorage.getItem(
        'role'
      );


    if (!role) {

      return null;

    }


    return role
      .trim()
      .toUpperCase();

  }


  // =========================
  // LOGIN STATUS
  // =========================

  isLoggedIn():
    boolean {

    return !!this.getToken();

  }


  // =========================
  // LOGOUT
  // =========================

  logout():
    void {

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'role'
    );

    localStorage.removeItem(
      'username'
    );

  }


  // =========================
  // ROLE HELPERS
  // =========================

  isNurse():
    boolean {

    return (
      this.getUserRole()
      === 'NURSE'
    );

  }


  isDoctor():
    boolean {

    return (
      this.getUserRole()
      === 'DOCTOR'
    );

  }


  isAdmin():
    boolean {

    return (
      this.getUserRole()
      === 'ADMIN'
    );

  }


}