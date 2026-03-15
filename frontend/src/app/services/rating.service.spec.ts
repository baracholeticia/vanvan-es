import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { RatingService, Rating } from './rating.service';

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RatingService] });
    service = TestBed.inject(RatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ─── listar ───────────────────────────────────────────────────────────────

  describe('listar', () => {
    it('should return all ratings ordered by date descending', async () => {
      const ratings = await firstValueFrom(service.listar());
      expect(ratings.length).toBeGreaterThan(0);
      for (let i = 1; i < ratings.length; i++) {
        const prev = new Date(ratings[i - 1].date).getTime();
        const curr = new Date(ratings[i].date).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });

    it('should filter by text (clientName)', async () => {
      const ratings = await firstValueFrom(service.listar('Maria'));
      expect(ratings.every(r => r.clientName.toLowerCase().includes('maria'))).toBe(true);
    });

    it('should filter by text (driverName)', async () => {
      const ratings = await firstValueFrom(service.listar('João Souza'));
      expect(ratings.every(r =>
        r.driverName.toLowerCase().includes('joão souza') ||
        r.clientName.toLowerCase().includes('joão souza') ||
        r.tripId.toLowerCase().includes('joão souza')
      )).toBe(true);
    });

    it('should filter negative ratings (score <= 3)', async () => {
      const ratings = await firstValueFrom(service.listar(undefined, 'negative'));
      expect(ratings.every(r => r.score <= 3)).toBe(true);
    });

    it('should filter unreviewed ratings', async () => {
      const ratings = await firstValueFrom(service.listar(undefined, 'unreviewed'));
      expect(ratings.every(r => !r.reviewed)).toBe(true);
    });

    it('should return empty array when text matches nothing', async () => {
      const ratings = await firstValueFrom(service.listar('xyzxyzxyz_nao_existe'));
      expect(ratings).toEqual([]);
    });
  });

  // ─── marcarComoAnalisado ──────────────────────────────────────────────────

  describe('marcarComoAnalisado', () => {
    it('should set reviewed=true on a rating', async () => {
      const rating = await firstValueFrom(service.marcarComoAnalisado('1'));
      expect(rating.reviewed).toBe(true);
      expect(rating.id).toBe('1');
    });

    it('should persist the change (subsequent listar reflects it)', async () => {
      await firstValueFrom(service.marcarComoAnalisado('5'));
      const unreviewed = await firstValueFrom(service.listar(undefined, 'unreviewed'));
      expect(unreviewed.find(r => r.id === '5')).toBeUndefined();
    });
  });

  // ─── ocultarComentario ────────────────────────────────────────────────────

  describe('ocultarComentario', () => {
    it('should set hidden=true on a rating', async () => {
      const rating = await firstValueFrom(service.ocultarComentario('1'));
      expect(rating.hidden).toBe(true);
      expect(rating.id).toBe('1');
    });
  });
});