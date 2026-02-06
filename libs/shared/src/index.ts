
export type { ISale, ISaleItem } from './interfaces/sale.interface';
export type { IAlert } from './interfaces/alert.interface';


// ============= ENTITIES =============
export * from './entities/author.entity';
export * from './entities/publisher.entity';
export * from './entities/genre.entity';
export * from './entities/book.entity';
export * from './entities/user.entity';
export * from './entities/audit-log.entity';
export * from './entities/inventory-snapshot.entity';
export { Alert, AlertType, AlertSeverity, AlertStatus } from './entities/alert.entity';
export * from './entities/inventory.entity';
export * from './entities/stock-movement.entity';
export { Sale, SaleItem, SaleStatus, PaymentMethod } from './entities/sale.entity';
export * from './entities/book-analytics.entity';

// ============= INTERFACES =============
export * from './interfaces/author.interface';
export * from './interfaces/publisher.interface';
export * from './interfaces/genre.interface';
export * from './interfaces/book.interface';
export * from './interfaces/user.interface';
export * from './interfaces/common.interface';
export * from './interfaces/analytics.interface';
export * from './interfaces/reports.interface';
export * from './interfaces/predictive.interface';

// ============= DTOs =============
export * from './dtos/books/create.dto';
export * from './dtos/books/update.dto';
export * from './dtos/books/filter.dto';
export * from './dtos/authors/create.dto';
export * from './dtos/authors/update.dto';
export * from './dtos/publishers/create.dto';
export * from './dtos/publishers/update.dto';
export * from './dtos/genres/create.dto';
export * from './dtos/genres/update.dto';
export * from './dtos/auth/login.dto';
export * from './dtos/auth/register.dto';
export * from './dtos/users/update.dto';
export * from './dtos/sales/create-sale.dto';
export { UpdateSaleStatusDto } from './dtos/sales/update-sale-status.dto';
export * from './dtos/sales/filter-sale.dto';

// ============= AUTH =============
export * from './auth/jwt-auth.guard';
export * from './auth/jwt.strategy';
export * from './auth/roles.guard';
export * from './auth/roles.decorator';

// ============= INTERCEPTORS =============
export * from './interceptors';

// ============= CONFIG =============
export * from './config/winston.config';

// ============= DATABASE =============
export * from './database/database.module';

// ============= KAFKA =============
export * from './kafka';
 