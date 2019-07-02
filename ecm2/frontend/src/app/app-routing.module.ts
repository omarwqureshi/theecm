import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GetEnvironmentsComponent} from './get-environments/get-environments.component';


const routes: Routes = [
  {
    path: 'environments',
    component: GetEnvironmentsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
