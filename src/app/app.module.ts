import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../environments/environment.prod';
import { BlankComponent } from './mocks/blank/blank.component';
import { HttpClientModule } from '@angular/common/http';
import { AddPetDialogModule } from './components/add-pet-dialog/add-pet-dialog.module';
import { AddPostDialogModule } from './components/add-post-dialog/add-post-dialog.module';
import { RateAppDialogModule } from './components/rate-app-dialog/rate-app-dialog.module';

@NgModule({
  declarations: [AppComponent, BlankComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    HttpClientModule,
    provideAuth(() => getAuth()),
    AddPetDialogModule,
    AddPostDialogModule,
    RateAppDialogModule,
  ],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
