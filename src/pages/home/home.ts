import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import {AuthService} from "../../providers/auth-service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public userDetails : any;
  public resposeData: any;
  public dataSet : any;
  userPostData = {"user_id":"", "token":""};

  constructor(public navCtrl: NavController, public app: App, public authService: AuthService) {
   const data = JSON.parse(localStorage.getItem('userData'));
   this.userDetails = data.userData;
   this.userPostData.user_id = this.userDetails.user_id;
   this.userPostData.token = this.userDetails.token;

   this.getFeed();

  }


  getFeed(){
   this.authService.postData(this.userPostData, "feed").then((result) =>{
    this.resposeData = result;
    if(this.resposeData.feedData){
    this.dataSet = this.resposeData.feedData;
    console.log(this.dataSet);
  }
  else{
    console.log("No access");
  }
    
   
    }, (err) => {
      //Connection failed message
    });
  }

  converTime(time){
  let a = new Date(time*1000);
  return a;
  }

  backToWelcome(){
   const root = this.app.getRootNav();
   root.popToRoot();
  }

  logout(){
    //Api Token Logout 
    localStorage.clear();
     setTimeout(()=> this.backToWelcome(), 1000);
  }

}
