import { Injectable } from '@angular/core';


/*
  Generated class for the UserData provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserData {
  public userDetails : any;

  constructor() {
    console.log('Hello UserData Provider');
  }

  getUserData(){
    if(localStorage.getItem('userData')){
   const data = JSON.parse(localStorage.getItem('userData'));
   this.userDetails = data.userData;
  }
  else{
     this.userDetails = '';
  }
  return this.userDetails;
  }

}
