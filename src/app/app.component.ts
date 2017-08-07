import {Component} from '@angular/core';
import {Platform, App, MenuController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SplitPane} from '../providers/split-pane';
import {Welcome} from '../pages/welcome/welcome';

@Component({templateUrl: 'app.html'})
export class MyApp {

  rootPage : any = Welcome;
  public userDetails : any;
  constructor(platform : Platform, statusBar : StatusBar, splashScreen : SplashScreen, public splitPane : SplitPane, public app : App, public menu : MenuController) {
    platform
      .ready()
      .then(() => {
        statusBar.styleDefault();
        splashScreen.hide();
      });

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
    this
      .menu
      .enable(false);
    setTimeout(() => this.backToWelcome(), 1000);
  }

}
