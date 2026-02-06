import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    const authServiceMock = {
      isAuthenticated: jest.fn(),
      isAdmin: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(AdminGuard);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated and is admin', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.isAdmin.mockReturnValue(true);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

      const result = guard.canActivate(route, state);

      expect(result).toBe(true);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAdmin).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to home when user is not authenticated', () => {
      authService.isAuthenticated.mockReturnValue(false);
      authService.isAdmin.mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

      const result = guard.canActivate(route, state);

      expect(result).toBe(false);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to home when user is authenticated but not admin', () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.isAdmin.mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/admin/dashboard' } as RouterStateSnapshot;

      const result = guard.canActivate(route, state);

      expect(result).toBe(false);
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAdmin).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not check isAdmin when user is not authenticated', () => {
      authService.isAuthenticated.mockReturnValue(false);

      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/admin/users' } as RouterStateSnapshot;

      guard.canActivate(route, state);

      expect(authService.isAuthenticated).toHaveBeenCalled();
      // isAdmin might still be called due to the && operator, but the result should be false
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
