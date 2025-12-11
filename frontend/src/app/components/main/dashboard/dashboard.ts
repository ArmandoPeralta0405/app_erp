import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTitleSubtitle
} from 'ng-apexcharts';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  colors: string[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  chartOptions: Partial<ChartOptions> = {};

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.dashboardService.getInventoryStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.initChart(data.chartData);
        this.loading = false;
        this.cd.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  initChart(chartData: { date: Date; count: number }[]) {
    const categories = chartData.map(item =>
      new Date(item.date).toLocaleDateString('es-PY', { month: 'short', day: 'numeric' })
    );
    const series = chartData.map(item => item.count);

    this.chartOptions = {
      series: [
        {
          name: 'Ajustes',
          data: series
        }
      ],
      chart: {
        type: 'line',
        height: 300,
        toolbar: {
          show: false
        }
      },
      plotOptions: {},
      dataLabels: {
        enabled: true,
        offsetY: -10,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: categories,
        position: 'bottom',
        labels: {
          offsetY: 0
        }
      },
      yaxis: {
        labels: {
          show: true
        }
      },
      title: {
        text: 'Ajustes de Inventario - Últimos 7 Días',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#0056b3'
        }
      },
      colors: ['#0056b3']
    };
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
