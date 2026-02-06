export interface IAlert {
  id: string;
  type: string; // AlertType enum from entity
  severity: string; // AlertSeverity enum from entity
  status: string; // AlertStatus enum from entity
  bookId?: string;
  bookTitle?: string;
  message: string;
  metadata?: Record<string, any>;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
