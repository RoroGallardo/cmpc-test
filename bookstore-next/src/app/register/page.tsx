'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { RegisterRequest } from '../../types/user';

export default function RegisterPage() {
  const router = useRouter();
  const { publicRegister } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm<RegisterRequest>({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof RegisterRequest, string>> = {};
      
      if (!values.email) {
        errors.email = 'El email es requerido';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email inválido';
      }
      
      if (!values.password) {
        errors.password = 'La contraseña es requerida';
      } else if (values.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (!values.name) {
        errors.name = 'El nombre es requerido';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      try {
        setError('');
        await publicRegister(values);
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al registrarse');
      }
    },
  });

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
          <p className="text-gray-600">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
            <p className="text-gray-600">Regístrate para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.name && errors.name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-purple-500'
                } focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Juan Pérez"
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.email && errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-purple-500'
                } focus:outline-none focus:ring-2 transition-colors`}
                placeholder="tu@email.com"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  touched.password && errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-purple-500'
                } focus:outline-none focus:ring-2 transition-colors`}
                placeholder="••••••••"
              />
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
