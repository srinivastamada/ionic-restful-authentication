
import {Component} from '@angular/core';
import {NavController, App} from 'ionic-angular';
import {AuthService} from "../../providers/auth-service";
import {Common} from "../../providers/common";

@Component({selector: 'page-home', templateUrl: 'home.html'})
export class HomePage {
  public userDetails : any;
  public resposeData : any;
  public dataSet : any;
  userPostData = {
    "user_id": "",
    "token": "",
    "feed":"",
    "feed_id":""
  };

  constructor(public navCtrl : NavController, public app : App, public common:Common, public authService : AuthService) {
    const data = JSON.parse(localStorage.getItem('userData'));
    this.userDetails = data.userData;
    this.userPostData.user_id = this.userDetails.user_id;
    this.userPostData.token = this.userDetails.token;

    this.getFeed();

  }

  getFeed() {
    this.common.presentLoading();
    this
      .authService
      .postData(this.userPostData, "feed")
      .then((result) => {
        this.resposeData = result;
        if (this.resposeData.feedData) {
          this.dataSet = this.resposeData.feedData;
          console.log(this.dataSet);
          this.common.closeLoading();
        } else {
          console.log("No access");
        }

      }, (err) => {
        //Connection failed message
      });
  }

  feedUpdate() {
    if(this.userPostData.feed){
    this.common.presentLoading();
    this
      .authService
      .postData(this.userPostData, "feedUpdate")
      .then((result) => {
        this.resposeData = result;
        if (this.resposeData.feedData) {
          this.dataSet.unshift(this.resposeData.feedData);
          this.userPostData.feed ="";
          this.common.closeLoading();
        } else {
          console.log("No access");
        }

      }, (err) => {
        //Connection failed message
      });
    }
    
  }

  feedDelete(feed_id, msgIndex){
    this.userPostData.feed_id = feed_id;

    if(feed_id){
      this.common.presentLoading();
       this
         .authService
         .postData(this.userPostData, "feedDelete")
         .then((result) => {
           this.resposeData = result;
           if (this.resposeData.success) {
             this.dataSet.splice(msgIndex, 1);
             this.common.closeLoading();
           } else {
             console.log("No access");
           }
   
         }, (err) => {
           //Connection failed message
         });
       }
  }

  converTime(time) {
    let a = new Date(time * 1000);
    return a;
  }

  backToWelcome() {
    const root = this
      .app
      .getRootNav();
    root.popToRoot();
  }

  logout() {
    //Api Token Logout
    localStorage.clear();
    setTimeout(() => this.backToWelcome(), 1000);
  }

}
