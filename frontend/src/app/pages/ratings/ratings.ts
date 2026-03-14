import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService, Rating } from '../../services/rating.service';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './ratings.html',
  styleUrl: './ratings.css',
})
export class RatingsComponent implements OnInit {
  private ratingService = inject(RatingService);
  private toastService = inject(ToastService);

  listaAvaliacoes = signal<Rating[]>([]);
  carregando = signal(true);

  // Filtros
  termoBusca = signal('');
  statusFiltro = signal('all');

  filtros = [
    { label: 'Todas', value: 'all' },
    { label: 'Negativas', value: 'negative' },
    { label: 'Ocultas', value: 'hidden' },
  ];

  // Computed stats
  totalPositivas = computed(() => this.listaAvaliacoes().filter(r => r.score >= 4).length);
  totalNegativas = computed(() => this.listaAvaliacoes().filter(r => r.score <= 3).length);

  mediaGeral = computed(() => {
    const lista = this.listaAvaliacoes();
    if (!lista.length) return 0;
    return lista.reduce((sum, r) => sum + r.score, 0) / lista.length;
  });

  // Contagem por filtro (para badge nos tabs)
  getContagem(filtro: string): number {
    switch (filtro) {
      case 'all':        return this.listaAvaliacoes().length;
      case 'negative':   return this.totalNegativas();
      case 'hidden':     return this.listaAvaliacoes().filter(r => r.status === 'HIDDEN').length;
      default:           return 0;
    }
  }

  ngOnInit() {
    this.carregarAvaliacoes();
  }

  carregarAvaliacoes() {
    this.carregando.set(true);
    const termo = this.termoBusca();
    const filterValue = this.statusFiltro();
    const isStatusBackend = filterValue === 'hidden' ? 'hidden' : undefined;

    this.ratingService.listar(isStatusBackend).subscribe({
      next: (pagina) => {
        let filtrados = pagina.content;

        if (filterValue === 'negative') {
          filtrados = filtrados.filter(r => r.score <= 3);
        }

        // Front-end local filter logic for search term
        if (termo) {
          const t = termo.toLowerCase();
          filtrados = filtrados.filter(r => 
            r.passengerName.toLowerCase().includes(t) ||
            r.driverName.toLowerCase().includes(t) ||
            r.tripId.toString().includes(t)
          );
        }

        this.listaAvaliacoes.set(filtrados);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar avaliações', err);
        this.toastService.error('Erro ao carregar as avaliações.');
        this.carregando.set(false);
      }
    });
  }

  onFilterChange() {
    this.carregarAvaliacoes();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.termoBusca.set(value);
    this.carregarAvaliacoes();
  }

  limparBusca() {
    this.termoBusca.set('');
    this.carregarAvaliacoes();
  }



  ocultarComentario(rating: Rating) {
    if (confirm('Tem certeza que deseja ocultar este comentário de outros usuários?')) {
      this.ratingService.ocultarComentario(rating.id).subscribe({
        next: (atualizado) => {
          const novaLista = this.listaAvaliacoes().map(r =>
            r.id === atualizado.id ? atualizado : r
          );
          this.listaAvaliacoes.set(novaLista);
          this.toastService.success('Comentário ocultado');
        },
        error: () => this.toastService.error('Erro ao ocultar comentário')
      });
    }
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}