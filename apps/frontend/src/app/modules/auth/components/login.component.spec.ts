import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock-token',
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    // No llamar fixture.detectChanges() para evitar problemas con el template
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.loginForm.value).toEqual({
        email: '',
        password: '',
      });
    });

    it('should have email and password controls', () => {
      expect(component.loginForm.contains('email')).toBe(true);
      expect(component.loginForm.contains('password')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate email is required', () => {
      const email = component.loginForm.get('email');
      email?.setValue('');
      expect(email?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const email = component.loginForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);
    });

    it('should validate password is required', () => {
      const password = component.loginForm.get('password');
      password?.setValue('');
      expect(password?.hasError('required')).toBe(true);
    });

    it('should validate password minimum length', () => {
      const password = component.loginForm.get('password');
      password?.setValue('123');
      expect(password?.hasError('minlength')).toBe(true);
    });

    it('should be valid with correct inputs', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should submit valid form and navigate to admin dashboard for admin user', (done) => {
      const adminResponse = {
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, role: 'admin' as const },
      };

      authService.login.mockReturnValue(of(adminResponse));

      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'admin@example.com',
          password: 'password123',
        });
        expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
        done();
      }, 100);
    });

    it('should submit valid form and navigate to books for regular user', (done) => {
      authService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'user@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });

      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/books']);
        done();
      }, 100);
    });

    it('should handle login error', (done) => {
      const errorResponse = {
        error: { message: 'Invalid credentials' },
      };

      authService.login.mockReturnValue(throwError(() => errorResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(component.error).toBe('Invalid credentials');
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should call authService.login with correct credentials', (done) => {
      authService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        done();
      }, 100);
    });

    it('should clear error on new submission', () => {
      component.error = 'Previous error';
      authService.login.mockReturnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.error).toBe('');
    });
  });

  describe('Getters', () => {
    it('should get email control', () => {
      expect(component.email).toBe(component.loginForm.get('email'));
    });

    it('should get password control', () => {
      expect(component.password).toBe(component.loginForm.get('password'));
    });
  });
});
