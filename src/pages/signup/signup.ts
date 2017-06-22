import {Component} from '@angular/core';
import {IonicPage, NavController} from 'ionic-angular';
import {AuthService} from "../../providers/auth-service";

import {TabsPage} from '../tabs/tabs';
import {Login} from "../login/login";

/**
 * Generated class for the Signup page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({selector: 'page-signup', templateUrl: 'signup.html'})
export class Signup {
  resposeData : any;
  userData = {"username":"", "password":"","email":"","name":""};
  constructor(public navCtrl : NavController, public authService : AuthService) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad Signup');
  }

  signup() {
    //Api connections
    this.authService.postData(this.userData, "signup").then((result) =>{
    this.resposeData = result;
    console.log(this.resposeData);
    localStorage.setItem('userData', JSON.stringify(this.resposeData) )
    this.navCtrl.push(TabsPage);
    }, (err) => {
      //Connection failed message
    });
  }

  login() {
    this
      .navCtrl
      .push(Login);
  }

}
