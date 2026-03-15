import { TestBed } from '@angular/core/testing';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { RatingsComponent } from './ratings';
import { RatingService, Rating } from '../../services/rating.service';
import { ToastService } from '../../components/toast/toast.service';

const mockRating = (overrides: Partial<Rating> = {}): Rating => ({
  id: '1',
  score: 5,
  comment: 'Excelente viagem!',
  clientName: 'Maria Silva',
  driverName: 'João Souza',
  tripId: 'TRP-001',
  date: '2024-01-15T10:00:00Z',
  reviewed: false,
  hidden: false,
  ...overrides
});

function makeRatingMock(ratings: Rating[] = [mockRating()]) {
  return {
    listar: vi.fn().mockReturnValue(of(ratings)),
    marcarComoAnalisado: vi.fn().mockReturnValue(of({ ...mockRating(), reviewed: true })),
    ocultarComentario: vi.fn().mockReturnValue(of({ ...mockRating(), hidden: true }))
  };
}

describe('RatingsComponent', () => {
  let component: RatingsComponent;
  let ratingMock: ReturnType<typeof makeRatingMock>;
  let toastMock: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    ratingMock = makeRatingMock([
      mockRating({ id: '1', score: 5, reviewed: false }),
      mockRating({ id: '2', score: 2, reviewed: false }),
      mockRating({ id: '3', score: 4, reviewed: true }),
    ]);
    toastMock = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DecimalPipe, RatingsComponent],
      providers: [
        { provide: RatingService, useValue: ratingMock },
        { provide: ToastService, useValue: toastMock }
      ]
    });
    component = TestBed.createComponent(RatingsComponent).componentInstance;
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should load ratings on init', () => {
      component.ngOnInit();
      expect(ratingMock.listar).toHaveBeenCalled();
      expect(component.listaAvaliacoes().length).toBe(3);
    });

    it('should set carregando=false after load', () => {
      component.ngOnInit();
      expect(component.carregando()).toBe(false);
    });

    it('should show error toast on failure', () => {
      ratingMock.listar.mockReturnValue(throwError(() => new Error('fail')));
      component.ngOnInit();
      expect(toastMock.error).toHaveBeenCalled();
      expect(component.carregando()).toBe(false);
    });
  });

  // ─── computed stats ───────────────────────────────────────────────────────

  describe('computed stats', () => {
    beforeEach(() => component.ngOnInit());

    it('totalPositivas should count ratings with score > 3', () => {
      expect(component.totalPositivas()).toBe(2); // scores 5 and 4
    });

    it('totalNegativas should count ratings with score <= 3', () => {
      expect(component.totalNegativas()).toBe(1); // score 2
    });

    it('totalPendentes should count unreviewed ratings', () => {
      expect(component.totalPendentes()).toBe(2); // ids 1 and 2
    });

    it('mediaGeral should calculate average score', () => {
      const expected = (5 + 2 + 4) / 3;
      expect(component.mediaGeral()).toBeCloseTo(expected);
    });

    it('mediaGeral should return 0 for empty list', () => {
      component.listaAvaliacoes.set([]);
      expect(component.mediaGeral()).toBe(0);
    });
  });

  // ─── getContagem ─────────────────────────────────────────────────────────

  describe('getContagem', () => {
    beforeEach(() => component.ngOnInit());

    it('should return total for "all"', () => {
      expect(component.getContagem('all')).toBe(3);
    });

    it('should return negative count for "negative"', () => {
      expect(component.getContagem('negative')).toBe(1);
    });

    it('should return pending count for "unreviewed"', () => {
      expect(component.getContagem('unreviewed')).toBe(2);
    });
  });

  // ─── marcarComoAnalisado ─────────────────────────────────────────────────

  describe('marcarComoAnalisado', () => {
    beforeEach(() => component.ngOnInit());

    it('should update rating in list and show success toast', () => {
      const rating = component.listaAvaliacoes().find(r => r.id === '1')!;
      component.marcarComoAnalisado(rating);
      const updated = component.listaAvaliacoes().find(r => r.id === '1')!;
      expect(updated.reviewed).toBe(true);
      expect(toastMock.success).toHaveBeenCalled();
    });

    it('should show error toast on failure', () => {
      ratingMock.marcarComoAnalisado.mockReturnValue(throwError(() => new Error('fail')));
      const rating = component.listaAvaliacoes()[0];
      component.marcarComoAnalisado(rating);
      expect(toastMock.error).toHaveBeenCalled();
    });
  });

  // ─── ocultarComentario ───────────────────────────────────────────────────

  describe('ocultarComentario', () => {
    beforeEach(() => {
      component.ngOnInit();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('should update rating hidden=true and show success toast', () => {
      ratingMock.ocultarComentario.mockReturnValue(of({ ...mockRating({ id: '1' }), hidden: true }));
      const rating = component.listaAvaliacoes().find(r => r.id === '1')!;
      component.ocultarComentario(rating);
      const updated = component.listaAvaliacoes().find(r => r.id === '1')!;
      expect(updated.hidden).toBe(true);
      expect(toastMock.success).toHaveBeenCalled();
    });

    it('should NOT call service when user cancels confirm', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const rating = component.listaAvaliacoes()[0];
      component.ocultarComentario(rating);
      expect(ratingMock.ocultarComentario).not.toHaveBeenCalled();
    });
  });

  // ─── getStarsArray ────────────────────────────────────────────────────────

  describe('getStarsArray', () => {
    it('should return [1, 2, 3, 4, 5]', () => {
      expect(component.getStarsArray()).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
