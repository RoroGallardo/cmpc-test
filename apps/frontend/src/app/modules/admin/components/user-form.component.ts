import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  userId: string | null = null;

  roles = [
    { value: 'user', label: 'Usuario' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['user', [Validators.required]],
      isActive: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser();
      // En modo edición, la contraseña no es requerida
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar usuario';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.error = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = { ...this.userForm.value };
    
    // Si es modo edición y no se ingresó contraseña, eliminar el campo
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    if (this.isEditMode && this.userId) {
      this.updateUser(formData);
    } else {
      this.createUser(formData);
    }
  }

  createUser(data: any): void {
    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al crear usuario';
        this.cdr.detectChanges();
      },
    });
  }

  updateUser(data: any): void {
    if (!this.userId) return;

    this.userService.updateUser(this.userId, data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al actualizar usuario';
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }

  get name() {
    return this.userForm.get('name');
  }

  get role() {
    return this.userForm.get('role');
  }

  get isActive() {
    return this.userForm.get('isActive');
  }
}
