import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RatingService } from './services/rating.service';

@Component({
  selector: 'app-rate-app-dialog',
  templateUrl: './rate-app-dialog.component.html',
  styleUrls: ['./rate-app-dialog.component.scss'],
})
export class RateAppDialogComponent implements OnInit {
  rating = 0;
  userId = localStorage.getItem('accessToken');
  hasRated = false;
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<RateAppDialogComponent>,
    private snackBar: MatSnackBar,
    private ratingService: RatingService,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}

  ngOnInit() {
    this.checkIfUserHasRated();
  }

  async checkIfUserHasRated() {
    if (this.userId) {
      try {
        const existingRating = await this.ratingService.getRating(this.userId);
        if (existingRating !== null) {
          this.hasRated = true;
          this.rating = existingRating;
        }
      } catch (error) {
        console.error('Error checking rating status:', error);
      }
    }
    this.loading = false;
  }

  rate(value: number) {
    if (!this.hasRated) {
      this.rating = value;
      const ratingText = value === 1 ? 'star' : 'stars';
      this.snackBar.open(`You rated ${value} ${ratingText}`, 'Close', {
        duration: 2000,
      });
    }
  }

  async submitRating() {
    if (this.userId && !this.hasRated) {
      try {
        await this.ratingService.saveRating(this.userId, this.rating);
        this.snackBar.open('Thank you for your rating!', 'Close', {
          duration: 2000,
        });
        this.dialogRef.close();
      } catch (error) {
        this.snackBar.open(
          'Failed to submit rating. Please try again.',
          'Close',
          {
            duration: 2000,
          }
        );
      }
    } else if (this.hasRated) {
      this.snackBar.open('You have already rated this app.', 'Close', {
        duration: 2000,
      });
    } else {
      this.snackBar.open('User is not authenticated.', 'Close', {
        duration: 2000,
      });
    }
  }
}
