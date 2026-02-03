import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from '../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers, body, params } = request;

    const startTime = Date.now();
    let oldValues: any = null;

    // Capturar datos antes de la operación (para UPDATE/DELETE)
    if (method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
      oldValues = { ...body };
    }

    return next.handle().pipe(
      tap({
        next: async (data) => {
          try {
            const executionTime = Date.now() - startTime;
            
            // Determinar acción basada en el método HTTP
            let action: AuditAction;
            switch (method) {
              case 'POST':
                action = AuditAction.CREATE;
                break;
              case 'PATCH':
              case 'PUT':
                action = AuditAction.UPDATE;
                break;
              case 'DELETE':
                action = AuditAction.DELETE;
                break;
              default:
                action = AuditAction.READ;
            }

            // Determinar tipo de entidad basado en la URL
            let entityType: AuditEntity | null = null;
            let entityId: string | null = null;

            if (url.includes('/books')) {
              entityType = AuditEntity.BOOK;
              entityId = params.id || data?.id;
            } else if (url.includes('/authors')) {
              entityType = AuditEntity.AUTHOR;
              entityId = params.id || data?.id;
            } else if (url.includes('/publishers')) {
              entityType = AuditEntity.PUBLISHER;
              entityId = params.id || data?.id;
            } else if (url.includes('/genres')) {
              entityType = AuditEntity.GENRE;
              entityId = params.id || data?.id;
            }

            // Solo auditar si tenemos tipo de entidad y ID
            if (entityType && entityId && action !== AuditAction.READ) {
              const changes = this.calculateChanges(oldValues, data);

              const auditLog = this.auditRepository.create({
                userId: user?.id || user?.sub,
                userEmail: user?.email,
                entityType,
                entityId,
                action,
                oldValues: action === AuditAction.UPDATE ? oldValues : null,
                newValues: data,
                changes,
                ipAddress: ip || headers['x-forwarded-for'] || headers['x-real-ip'],
                userAgent: headers['user-agent'],
                endpoint: url,
                method,
              });

              await this.auditRepository.save(auditLog);
            }
          } catch (error) {
            // No queremos que falle la request si falla el audit log
            console.error('Error saving audit log:', error);
          }
        },
        error: (error) => {
          // Opcionalmente, también podemos auditar errores
          console.error('Request error:', error);
        },
      }),
    );
  }

  private calculateChanges(oldValues: any, newValues: any): Record<string, { old: any; new: any }> | null {
    if (!oldValues || !newValues) return null;

    const changes: Record<string, { old: any; new: any }> = {};

    // Comparar valores antiguos y nuevos
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          old: oldValues[key],
          new: newValues[key],
        };
      }
    });

    return Object.keys(changes).length > 0 ? changes : null;
  }
}
