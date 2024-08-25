import { Component, OnInit } from '@angular/core';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { RatingService } from '../../components/rate-app-dialog/services/rating.service';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  ratingCounts: number[] = [0, 0, 0, 0, 0];
  averageRating: number = 0;
  totalRatings: number = 0;
  modeRating: number = 0;
  chart: any;

  constructor(private ratingService: RatingService) {}

  async ngOnInit() {
    await this.loadRatingCounts();
    this.calculateAdditionalStats();
    this.renderChart();
  }

  async loadRatingCounts() {
    this.ratingCounts = await this.ratingService.getRatingCounts();

    const totalRatings = this.ratingCounts.reduce(
      (sum, count, index) => sum + count * (index + 1),
      0
    );
    const numberOfRatings = this.ratingCounts.reduce(
      (sum, count) => sum + count,
      0
    );

    this.averageRating = numberOfRatings ? totalRatings / numberOfRatings : 0;
  }

  calculateAdditionalStats() {
    this.totalRatings = this.ratingCounts.reduce(
      (sum, count) => sum + count,
      0
    );

    const maxCount = Math.max(...this.ratingCounts);
    this.modeRating = this.ratingCounts.indexOf(maxCount) + 1;
  }

  renderChart() {
    const ctx = document.getElementById('ratingChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [
          {
            label: 'Number of Ratings',
            data: this.ratingCounts,
            backgroundColor: [
              'rgba(255, 182, 193, 0.7)',
              'rgba(255, 105, 180, 0.7)',
              'rgba(255, 20, 147, 0.7)',
              'rgba(219, 112, 147, 0.7)',
              'rgba(199, 21, 133, 0.7)',
            ],
            borderColor: [
              'rgba(255, 182, 193, 1)',
              'rgba(255, 105, 180, 1)',
              'rgba(255, 20, 147, 1)',
              'rgba(219, 112, 147, 1)',
              'rgba(199, 21, 133, 1)',
            ],
            borderWidth: 1,
            hoverBackgroundColor: [
              'rgba(255, 182, 193, 0.9)',
              'rgba(255, 105, 180, 0.9)',
              'rgba(255, 20, 147, 0.9)',
              'rgba(219, 112, 147, 0.9)',
              'rgba(199, 21, 133, 0.9)',
            ],
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Rating',
              color: '#333',
              font: {
                size: 18,
              },
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Users',
              color: '#333',
              font: {
                size: 18,
              },
            },
            ticks: {
              precision: 0,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 12,
            },
            footerFont: {
              size: 10,
            },
          },
        },
      },
    });
  }
}
