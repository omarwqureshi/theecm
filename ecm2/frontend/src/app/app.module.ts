import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GetEnvironmentsComponent } from './get-environments/get-environments.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AngularMaterialModule} from './material.module';
import {HttpClientModule} from '@angular/common/http';
import {ApiService} from './shared/api.service';

@NgModule({
  declarations: [
    AppComponent,
    GetEnvironmentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
