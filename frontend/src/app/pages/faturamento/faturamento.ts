import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
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

// Registrar os componentes do Chart.js
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ===== Dados de Resumo =====
  summary = {
    totalMonth: 4520.00,
    totalWeek: 1280.00,
    totalToday: 180.00,
    tripsMonth: 32,
    tripsWeek: 9,
    avgRating: 4.8,
    percentChange: 12.5 // Comparado ao mês anterior
  };

  // ===== Dados para Gráfico de Linha (Faturamento Mensal) =====
  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        data: [2800, 3200, 2950, 3800, 4100, 3600, 4200, 4520, 0, 0, 0, 0],
        label: 'Faturamento (R$)',
        fill: true,
        tension: 0.4,
        borderColor: '#1E88E5',
        backgroundColor: 'rgba(30, 136, 229, 0.1)',
        pointBackgroundColor: '#1E88E5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1B1B1F',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `R$ ${(context.parsed.y ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#646464' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#646464',
          callback: (value) => `R$ ${value}`
        }
      }
    }
  };

  // ===== Dados para Gráfico de Barras (Viagens por Semana) =====
  barChartData: ChartData<'bar'> = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [2, 3, 1, 4, 3, 5, 2],
        label: 'Viagens',
        backgroundColor: '#1E88E5',
        borderRadius: 8,
        barThickness: 24
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1B1B1F',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#646464' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#646464',
          stepSize: 1
        }
      }
    }
  };

  // ===== Dados para Gráfico de Rosca (Destinos Populares) =====
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Recife', 'Garanhuns', 'Caruaru', 'Petrolina', 'Outros'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          '#1E88E5',
          '#F66B0E',
          '#31D0AA',
          '#9333EA',
          '#94A3B8'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: '#1B1B1F',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1B1B1F',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`
        }
      }
    }
  };

  // ===== Período selecionado =====
  selectedPeriod: 'week' | 'month' | 'year' = 'month';

  ngOnInit(): void {
    // Carregar dados do backend quando disponível
  }

  goBack(): void {
    this.router.navigate(['/motorista']);
  }

  setPeriod(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    // TODO: Recarregar dados baseado no período
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

