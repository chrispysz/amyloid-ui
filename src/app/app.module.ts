import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AmyloidModule } from './amyloid/amyloid.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AmyloidModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
