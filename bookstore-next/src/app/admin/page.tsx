'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminRoute from '../../components/AdminRoute';
import Navbar from '../../components/Navbar';
import { bookService } from '../../services/book.service';
import { userService } from '../../services/user.service';
import { Author, Genre, Publisher } from '../../types/book';
import { User } from '../../types/user';

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}

function AdminContent() {
  const [stats, setStats] = useState({
    authors: 0,
    genres: 0,
    publishers: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [authors, genres, publishers, users] = await Promise.all([
        bookService.getAuthors(),
        bookService.getGenres(),
        bookService.getPublishers(),
        userService.getUsers(),
      ]);
      setStats({
        authors: authors.length,
        genres: genres.length,
        publishers: publishers.length,
        users: users.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Autores',
      description: 'Gestionar autores de libros',
      icon: '👤',
      count: stats.authors,
      href: '/admin/authors',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Géneros',
      description: 'Gestionar géneros literarios',
      icon: '📚',
      count: stats.genres,
      href: '/admin/genres',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Editoriales',
      description: 'Gestionar editoriales',
      icon: '🏢',
      count: stats.publishers,
      href: '/admin/publishers',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios del sistema',
      icon: '👥',
      count: stats.users,
      href: '/admin/users',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Reportes',
      description: 'Ver reportes y análisis',
      icon: '📊',
      count: 0,
      href: '/admin/reports',
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Predicciones',
      description: 'Análisis predictivo de ventas',
      icon: '🔮',
      count: 0,
      href: '/admin/predictions',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona todos los aspectos del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block group"
            >
              <div className={`bg-gradient-to-br ${section.color} rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl opacity-90">{section.icon}</div>
                  {section.count > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
                      {section.count}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-white/90 text-sm">{section.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium">
                  <span>Gestionar</span>
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
