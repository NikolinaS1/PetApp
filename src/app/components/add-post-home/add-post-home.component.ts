import { Component, ViewChild } from '@angular/core';
import { AddPostDialogComponent } from '../../components/add-post-dialog/add-post-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-add-post-home',
  templateUrl: './add-post-home.component.html',
  styleUrl: './add-post-home.component.scss',
})
export class AddPostHomeComponent {
  constructor(private dialog: MatDialog) {}

  openAddPostDialog(): void {
    this.dialog.open(AddPostDialogComponent, {
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
    });
  }
}
