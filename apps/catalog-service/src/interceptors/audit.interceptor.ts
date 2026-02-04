import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLog, AuditAction, AuditEntity } from '@cmpc-test/shared';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Solo auditar operaciones de modificación
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Detectar tipo de entidad basado en la URL
    const entityType = this.getEntityType(url);
    if (!entityType) {
      return next.handle();
    }

    const action = this.getAction(method);
    const oldValues = request.body; // Para UPDATE/DELETE, idealmente obtener el estado anterior

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Extraer entity ID de la respuesta
          const entityId = response?.id || request.params?.id;
          
          if (!entityId) return;

          const audit = this.auditRepo.create({
            userId: user?.id || user?.sub,
            userEmail: user?.email,
            entityType,
            entityId,
            action,
            oldValues: method === 'PUT' || method === 'PATCH' ? oldValues : null,
            newValues: response,
            changes: this.calculateChanges(oldValues, response),
            ipAddress: ip || request.connection?.remoteAddress,
            userAgent: headers['user-agent'],
            endpoint: url,
            method,
          });

          await this.auditRepo.save(audit);
        } catch (error) {
          // No fallar la request si falla la auditoría
          console.error('Error creating audit log:', error);
        }
      }),
    );
  }

  private getEntityType(url: string): AuditEntity | null {
    if (url.includes('/books')) return AuditEntity.BOOK;
    if (url.includes('/authors')) return AuditEntity.AUTHOR;
    if (url.includes('/publishers')) return AuditEntity.PUBLISHER;
    if (url.includes('/genres')) return AuditEntity.GENRE;
    if (url.includes('/sales')) return AuditEntity.SALE;
    return null;
  }

  private getAction(method: string): AuditAction {
    switch (method) {
      case 'POST': return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH': return AuditAction.UPDATE;
      case 'DELETE': return AuditAction.DELETE;
      default: return AuditAction.READ;
    }
  }

  private calculateChanges(oldValues: any, newValues: any): Record<string, { old: any; new: any }> {
    if (!oldValues || !newValues) return {};

    const changes: Record<string, { old: any; new: any }> = {};
    
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          old: oldValues[key],
          new: newValues[key],
        };
      }
    }

    return changes;
  }
}
