import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Welcome } from './welcome';

@NgModule({
  declarations: [
    Welcome,
  ],
  imports: [
    IonicPageModule.forChild(Welcome),
  ],
  exports: [
    Welcome
  ]
})
export class WelcomeModule {}
