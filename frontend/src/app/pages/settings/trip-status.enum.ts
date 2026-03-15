export enum TripStatus {
  SCHEDULED   = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED   = 'COMPLETED',
  CANCELLED   = 'CANCELLED'
}

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  [TripStatus.SCHEDULED]:   'Agendada',
  [TripStatus.IN_PROGRESS]: 'Em andamento',
  [TripStatus.COMPLETED]:   'Finalizada',
  [TripStatus.CANCELLED]:   'Cancelada'
};