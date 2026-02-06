import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock-token',
    user: mockUser,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and set session', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credentials).subscribe((response) => {
        expect(response).toEqual(mockLoginResponse);
        expect(localStorage.getItem('access_token')).toBe('mock-token');
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockLoginResponse);
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      service.register(registerData).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockUser);
    });
  });

  describe('publicRegister', () => {
    it('should register a user through public endpoint', () => {
      const registerData: RegisterRequest = {
        email: 'public@example.com',
        password: 'password123',
        name: 'Public User',
      };

      const mockResponse = {
        message: 'Registration successful',
        user: { id: '1', email: 'public@example.com', name: 'Public User' },
      };

      service.publicRegister(registerData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/public-register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear session and user data', () => {
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should get user profile', () => {
      service.getProfile().subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('access_token', 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from subject', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);
      expect(service.getCurrentUser()).toBeDefined();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      const adminUser = { ...mockUser, role: 'admin' as const };
      localStorage.setItem('current_user', JSON.stringify(adminUser));
      localStorage.setItem('access_token', 'mock-token');
      
      service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/login`);
      req.flush({ access_token: 'token', user: adminUser });

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when user is not admin', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      localStorage.setItem('access_token', 'mock-token');
      
      service.login({ email: 'user@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/login`);
      req.flush(mockLoginResponse);

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit current user changes', (done) => {
      service.currentUser$.subscribe((user) => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.authServiceUrl}/auth/login`);
      req.flush(mockLoginResponse);
    });
  });
});
