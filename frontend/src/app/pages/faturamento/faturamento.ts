import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-faturamento',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './faturamento.html',
  styleUrls: ['./faturamento.css']
})
export class Faturamento implements OnInit {
  isBrowser = false;

  constructor(
    private router: Router,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ===== Summary Data =====
  summary = {
    totalMonth: 4520.00,
    totalWeek: 1280.00,
    totalToday: 180.00,
    tripsMonth: 32,
    tripsWeek: 9,
    avgRating: 4.8,
    percentChange: 12.5
  };

  // ===== Block Chart Data (stacked blocks per month — equal size, faded opacity) =====
  blockChartData = [
    { label: 'Jan', value: 'R$ 2.800', blocks: 3, highlight: false },
    { label: 'Fev', value: 'R$ 3.200', blocks: 4, highlight: false },
    { label: 'Mar', value: 'R$ 2.950', blocks: 3, highlight: false },
    { label: 'Abr', value: 'R$ 3.800', blocks: 4, highlight: false },
    { label: 'Mai', value: 'R$ 4.100', blocks: 4, highlight: false },
    { label: 'Jun', value: 'R$ 3.600', blocks: 4, highlight: false },
    { label: 'Jul', value: 'R$ 4.200', blocks: 5, highlight: false },
    { label: 'Ago', value: 'R$ 4.520', blocks: 5, highlight: true },
  ];

  hoveredBlockIndex: number | null = null;

  getBlockOpacities(numBlocks: number, highlight: boolean): number[] {
    const opacities: number[] = [];
    for (let i = 0; i < numBlocks; i++) {
      const base = highlight ? 0.5 : 0.2;
      const step = highlight ? 0.5 / numBlocks : 0.8 / numBlocks;
      opacities.push(Math.min(base + step * (i + 1), 1));
    }
    return opacities;
  }

  hoveredTypeIndex: number | null = null;
  hoveredHourIndex: number | null = null;

  // ===== Monthly Goal =====
  monthlyGoal = 6000.00;

  get monthlyGoalPercent(): number {
    return Math.min(Math.round((this.summary.totalMonth / this.monthlyGoal) * 100), 100);
  }

  get ringCircumference(): number {
    return 2 * Math.PI * 80; // r=80 (larger ring)
  }

  get ringOffset(): number {
    const percent = this.monthlyGoalPercent / 100;
    return this.ringCircumference * (1 - percent);
  }

  // ===== Quick Metrics =====
  metrics = {
    totalKm: 7360,
    totalPassengers: 384,
    avgPerTrip: 141.25,
    totalHours: 96,
    maxKm: 10000,
    maxPassengers: 500,
    maxPerTrip: 200,
    maxHours: 160,
  };

  // ===== Efficiency Ring =====
  efficiencyPercent = 78;

  get efficiencyCircumference(): number {
    return 2 * Math.PI * 52;
  }

  get efficiencyOffset(): number {
    return this.efficiencyCircumference * (1 - this.efficiencyPercent / 100);
  }

  // ===== Peak Hours (flattened for 4x4 grid = 16 items) =====
  peakHours = [
    { label: '06h', intensity: 20 },
    { label: '08h', intensity: 85 },
    { label: '10h', intensity: 40 },
    { label: '12h', intensity: 55 },
    { label: '07h', intensity: 45 },
    { label: '09h', intensity: 70 },
    { label: '11h', intensity: 30 },
    { label: '13h', intensity: 35 },
    { label: '14h', intensity: 50 },
    { label: '16h', intensity: 90 },
    { label: '18h', intensity: 80 },
    { label: '20h', intensity: 25 },
    { label: '15h', intensity: 60 },
    { label: '17h', intensity: 100 },
    { label: '19h', intensity: 45 },
    { label: '21h', intensity: 15 },
  ];

  // ===== Earnings by Type =====
  earningsByType = [
    { label: 'Passageiros', value: 3200, percent: 71, color: '#F66B0E' },
    { label: 'Encomendas', value: 820, percent: 18, color: '#557D96' },
    { label: 'Frete', value: 500, percent: 11, color: '#31D0AA' },
  ];

  // ===== Recent Trips =====
  recentTrips = [
    { route: 'Garanhuns → Recife', date: 'Hoje, 14:30', earnings: 180.00, passengers: 12 },
    { route: 'Recife → Garanhuns', date: 'Ontem, 16:00', earnings: 175.00, passengers: 8 },
    { route: 'Garanhuns → Caruaru', date: '03/03, 08:00', earnings: 95.00, passengers: 10 },
    { route: 'Caruaru → Recife', date: '02/03, 09:00', earnings: 130.00, passengers: 14 },
  ];

  // ===== Monthly Comparison =====
  monthComparison = [
    {
      label: 'Faturamento',
      current: 'R$ 4.520',
      previous: 'R$ 4.018',
      change: '+12,5%',
      changePositive: true,
      currentPercent: 100,
      previousPercent: 89,
    },
    {
      label: 'Viagens',
      current: '32',
      previous: '28',
      change: '+14,3%',
      changePositive: true,
      currentPercent: 100,
      previousPercent: 87,
    },
    {
      label: 'Passageiros',
      current: '384',
      previous: '312',
      change: '+23,1%',
      changePositive: true,
      currentPercent: 100,
      previousPercent: 81,
    },
    {
      label: 'Cancelamentos',
      current: '2',
      previous: '5',
      change: '-60%',
      changePositive: true,
      currentPercent: 40,
      previousPercent: 100,
    },
  ];

  // ===== Destinations Data (top 3 only for visual legend) =====
  destinations = [
    { name: 'Vila Velha', percent: 65, color: '#557D96' },
    { name: 'Recife', percent: 45, color: '#F66B0E' },
    { name: 'Caruaru', percent: 15, color: '#31D0AA' },
  ];

  // ===== Line Chart — Monthly Revenue =====
  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'],
    datasets: [
      {
        data: [2800, 3200, 2950, 3800, 4100, 3600, 4200, 4520],
        label: 'Faturamento (R$)',
        fill: true,
        tension: 0.45,
        borderColor: '#F66B0E',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(246, 107, 14, 0.1)';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(246, 107, 14, 0.3)');
          gradient.addColorStop(0.5, 'rgba(246, 107, 14, 0.08)');
          gradient.addColorStop(1, 'rgba(246, 107, 14, 0.0)');
          return gradient;
        },
        pointBorderColor: '#FAFAFA',
        pointBorderWidth: 3,
        pointRadius: [3, 3, 3, 3, 3, 3, 3, 6],
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#F66B0E',
        pointHoverBorderWidth: 4,
        pointBackgroundColor: '#F66B0E',
        borderWidth: 3,
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 43, 60, 0.92)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 14,
        cornerRadius: 14,
        displayColors: false,
        callbacks: {
          label: (context) => `R$ ${(context.parsed.y ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#94A3B8',
          font: { size: 11, weight: 500 as any }
        }
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.04)',
          drawTicks: false,
        },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: '#94A3B8',
          font: { size: 11 },
          padding: 8,
          callback: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`
        }
      }
    }
  };

  // ===== Bar Chart — Trips per Day =====
  barChartData: ChartData<'bar'> = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [2, 3, 1, 4, 3, 5, 2],
        label: 'Viagens',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#F66B0E';
          const values = [2, 3, 1, 4, 3, 5, 2];
          const maxVal = Math.max(...values);
          if (context.dataIndex !== undefined && values[context.dataIndex] === maxVal) {
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#557D96');
            gradient.addColorStop(1, '#6F9DB8');
            return gradient;
          }
          // Create hatching pattern for non-peak bars using primary color
          const patternCanvas = document.createElement('canvas');
          patternCanvas.width = 8;
          patternCanvas.height = 8;
          const pctx = patternCanvas.getContext('2d')!;
          pctx.fillStyle = '#F66B0E';
          pctx.fillRect(0, 0, 8, 8);
          pctx.strokeStyle = 'rgba(255,255,255,0.4)';
          pctx.lineWidth = 1.5;
          pctx.beginPath();
          pctx.moveTo(0, 8);
          pctx.lineTo(8, 0);
          pctx.stroke();
          pctx.beginPath();
          pctx.moveTo(-2, 2);
          pctx.lineTo(2, -2);
          pctx.stroke();
          pctx.beginPath();
          pctx.moveTo(6, 10);
          pctx.lineTo(10, 6);
          pctx.stroke();
          return ctx.createPattern(patternCanvas, 'repeat')!;
        },
        hoverBackgroundColor: '#F66B0E',
        borderRadius: 999,
        borderSkipped: false,
        barPercentage: 0.75,
        categoryPercentage: 0.65,
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 43, 60, 0.92)',
        padding: 14,
        cornerRadius: 14,
        displayColors: false,
        titleFont: { weight: 'bold' },
        callbacks: {
          label: (context) => `${context.parsed.y} viagens`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#94A3B8',
          font: { size: 11, weight: 500 as any }
        }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false },
        border: { display: false },
        ticks: {
          color: '#94A3B8',
          font: { size: 11 },
          stepSize: 1,
          padding: 8,
        }
      }
    }
  };

  // ===== Doughnut Chart — Popular Destinations =====
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Recife', 'Garanhuns', 'Caruaru', 'Petrolina', 'Outros'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        borderColor: '#F66B0E',
        backgroundColor: [
          '#F66B0E',
          '#557D96',
          '#31D0AA',
          '#9333EA',
          '#94A3B8'
        ],
        borderWidth: 0,
        hoverOffset: 12,
        spacing: 3,
      }
    ]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 43, 60, 0.92)',
        padding: 14,
        cornerRadius: 14,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`
        }
      }
    }
  };

  // ===== Period selector =====
  selectedPeriod: 'week' | 'month' | 'year' = 'month';

  ngOnInit(): void {
    // Load data from backend when available
  }

  goBack(): void {
    this.location.back();
  }

  goToTrips(): void {
    this.router.navigate(['/viagens-motorista']);
  }

  setPeriod(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    // TODO: Reload data based on period
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ===== Sparkline helpers =====
  getSparklinePath(data: number[], width: number = 80, height: number = 28): string {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    return data.map((val, i) => {
      const x = i * step;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }

  getSparklineAreaPath(data: number[], width: number = 80, height: number = 28): string {
    const linePath = this.getSparklinePath(data, width, height);
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  }

  getMetricPercent(value: number, max: number): number {
    return Math.min(Math.round((value / max) * 100), 100);
  }

  getSmallRingCircumference(): number {
    return 2 * Math.PI * 18;
  }

  getSmallRingOffset(percent: number): number {
    return this.getSmallRingCircumference() * (1 - percent / 100);
  }

  getHeatColor(intensity: number): string {
    if (intensity >= 80) return 'rgba(246, 107, 14, 0.9)';
    if (intensity >= 60) return 'rgba(246, 107, 14, 0.6)';
    if (intensity >= 40) return 'rgba(246, 107, 14, 0.35)';
    if (intensity >= 20) return 'rgba(246, 107, 14, 0.15)';
    return 'rgba(246, 107, 14, 0.06)';
  }

  getIntensityOpacity(intensity: number): number {
    return Math.max(0.25, intensity / 100);
  }
}
