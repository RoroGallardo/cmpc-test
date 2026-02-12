'use client';

import { useState, useEffect } from 'react';
import { Book, CreateBookDto, Author, Genre, Publisher } from '../types/book';
import { bookService } from '../services/book.service';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  book?: Book | null;
}

export default function BookModal({ isOpen, onClose, onSuccess, book }: BookModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [available, setAvailable] = useState(true);
  const [authorId, setAuthorId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  
  // Catalog data
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Load catalogs on mount
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        const [authorsData, genresData, publishersData] = await Promise.all([
          bookService.getAuthors(),
          bookService.getGenres(),
          bookService.getPublishers(),
        ]);
        setAuthors(authorsData);
        setGenres(genresData);
        setPublishers(publishersData);
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        setError('Error al cargar catálogos');
      } finally {
        setLoadingCatalogs(false);
      }
    };

    if (isOpen) {
      loadCatalogs();
    }
  }, [isOpen]);

  // Load book data when editing
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setPublicationDate(book.publicationDate.split('T')[0]);
      setStock(book.stock);
      setPrice(book.price);
      setAvailable(book.available);
      setAuthorId(book.author.id);
      setGenreId(book.genre.id);
      setPublisherId(book.publisher.id);
      setImageBase64(book.imageBase64);
    } else {
      resetForm();
    }
  }, [book]);

  const resetForm = () => {
    setTitle('');
    setPublicationDate('');
    setStock(0);
    setPrice(0);
    setAvailable(true);
    setAuthorId('');
    setGenreId('');
    setPublisherId('');
    setImageBase64(undefined);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remover el prefijo data:image/...;base64, para evitar duplicación
      const base64Data = base64String.split(',')[1];
      setImageBase64(base64Data);
      setError(null);
    };
    reader.onerror = () => {
      setError('Error al leer la imagen');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!publicationDate) {
      setError('La fecha de publicación es requerida');
      return;
    }
    if (stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }
    if (price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }
    if (!authorId) {
      setError('Debes seleccionar un autor');
      return;
    }
    if (!genreId) {
      setError('Debes seleccionar un género');
      return;
    }
    if (!publisherId) {
      setError('Debes seleccionar una editorial');
      return;
    }

    try {
      setLoading(true);

      const bookData: CreateBookDto = {
        title,
        publicationDate,
        stock: Number(stock),
        price: Number(price),
        available,
        authorId,
        genreId,
        publisherId,
        imageBase64,
      };

      if (book) {
        // Update
        await bookService.updateBook(book.id, bookData);
      } else {
        // Create
        await bookService.createBook(bookData);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el libro');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {book ? 'Editar Libro' : 'Nuevo Libro'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadingCatalogs ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor *
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar autor</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar género</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Editorial *
              </label>
              <select
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar editorial</option>
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Publicación *
                </label>
                <input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (CLP) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {imageBase64 && (
                <div className="mt-2">
                  <img
                    src={`data:image/jpeg;base64,${imageBase64}`}
                    alt="Vista previa"
                    className="h-32 w-auto object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                Disponible para venta
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Guardando...' : book ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
