import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  const mockRegisterResponse = {
    message: 'Usuario registrado exitosamente',
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
  };

  beforeEach(async () => {
    const authServiceMock = {
      publicRegister: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
      expect(component.registerForm.value).toEqual({
        email: '',
        password: '',
        name: '',
      });
    });

    it('should have email, password, and name controls', () => {
      expect(component.registerForm.contains('email')).toBe(true);
      expect(component.registerForm.contains('password')).toBe(true);
      expect(component.registerForm.contains('name')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should validate email is required', () => {
      const email = component.registerForm.get('email');
      email?.setValue('');
      expect(email?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      const email = component.registerForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBe(true);
    });

    it('should validate password is required', () => {
      const password = component.registerForm.get('password');
      password?.setValue('');
      expect(password?.hasError('required')).toBe(true);
    });

    it('should validate password minimum length', () => {
      const password = component.registerForm.get('password');
      password?.setValue('123');
      expect(password?.hasError('minlength')).toBe(true);
    });

    it('should validate name is required', () => {
      const name = component.registerForm.get('name');
      name?.setValue('');
      expect(name?.hasError('required')).toBe(true);
    });

    it('should validate name minimum length', () => {
      const name = component.registerForm.get('name');
      name?.setValue('ab');
      expect(name?.hasError('minlength')).toBe(true);
    });

    it('should be valid with correct inputs', () => {
      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(component.registerForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        email: '',
        password: '',
        name: '',
      });

      component.onSubmit();

      expect(authService.publicRegister).not.toHaveBeenCalled();
      expect(component.error).toBe('Por favor, complete todos los campos correctamente.');
      expect(component.loading).toBe(false);
    });

    it('should mark all fields as touched when invalid', () => {
      component.onSubmit();
      expect(component.registerForm.get('email')?.touched).toBe(true);
      expect(component.registerForm.get('password')?.touched).toBe(true);
      expect(component.registerForm.get('name')?.touched).toBe(true);
    });

    it('should submit valid form successfully', (done) => {
      authService.publicRegister.mockReturnValue(of(mockRegisterResponse));

      component.registerForm.patchValue({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      component.onSubmit();

      expect(authService.publicRegister).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(component.success).toBe(true);
        expect(component.successMessage).toContain('Usuario registrado exitosamente');
        done();
      }, 100);
    });

    it('should reset form after successful registration', () => {
      authService.publicRegister.mockReturnValue(of(mockRegisterResponse));

      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.registerForm.value).toEqual({
          email: null,
          password: null,
          name: null,
        });
      }, 100);
    });

    it('should handle registration error', () => {
      const errorResponse = {
        error: { message: 'Email already exists' },
      };

      authService.publicRegister.mockReturnValue(throwError(() => errorResponse));

      component.registerForm.patchValue({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(component.error).toBe('Email already exists');
        expect(component.success).toBe(false);
      }, 100);
    });

    it('should clear previous errors on new submission', () => {
      component.error = 'Previous error';
      authService.publicRegister.mockReturnValue(of(mockRegisterResponse));

      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      component.onSubmit();

      expect(component.error).toBe('');
    });

    it('should use default success message when not provided', () => {
      const responseWithoutMessage = {
        message: '',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      authService.publicRegister.mockReturnValue(of(responseWithoutMessage));

      component.registerForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.successMessage).toBe(
          'Usuario registrado exitosamente. Espere la activación por un administrador.'
        );
      }, 100);
    });
  });

  describe('Getters', () => {
    it('should get email control', () => {
      expect(component.email).toBe(component.registerForm.get('email'));
    });

    it('should get password control', () => {
      expect(component.password).toBe(component.registerForm.get('password'));
    });

    it('should get name control', () => {
      expect(component.name).toBe(component.registerForm.get('name'));
    });
  });
});
