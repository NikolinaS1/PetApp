import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSsoDirective } from './google-sso.directive';

@NgModule({
  declarations: [GoogleSsoDirective],
  imports: [CommonModule],
  exports: [GoogleSsoDirective],
})
export class GoogleSsoModule {}
