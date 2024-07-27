import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRightPanelComponent } from './chat-right-panel.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ChatRightPanelComponent],
  imports: [
    CommonModule,
    TextFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [ChatRightPanelComponent],
})
export class ChatRightPanelModule {}
