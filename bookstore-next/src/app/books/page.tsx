'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import BookModal from '../../components/BookModal';
import { useBooks } from '../../hooks/useBooks';
import { Book } from '../../types/book';
import { bookService } from '../../services/book.service';

export default function BooksPage() {
  return (
    <ProtectedRoute>
      <BooksContent />
    </ProtectedRoute>
  );
}

function BooksContent() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filters = useMemo(() => ({
    search: search || undefined,
    genreId: selectedGenre || undefined,
    page,
    limit: 12,
  }), [search, selectedGenre, page]);

  const { books, pagination, loading, error, refetch } = useBooks(filters);

  const handleCreateBook = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${book.title}"?`)) {
      return;
    }

    try {
      setIsDeleting(book.id);
      await bookService.deleteBook(book.id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el libro');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const getImageSrc = (imageBase64?: string) => {
    if (!imageBase64) return null;
    // Si la imagen ya tiene el prefijo data:, usarla directamente
    if (imageBase64.startsWith('data:')) {
      return imageBase64;
    }
    // Si no, agregar el prefijo
    return `data:image/jpeg;base64,${imageBase64}`;
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Libros</h1>
          <button
            onClick={handleCreateBook}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Libro
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, autor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de libros */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando libros...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-600 text-sm">El servicio de catálogo no está disponible. Verifica que esté corriendo.</p>
            </div>
          </div>
        ) : !Array.isArray(books) || books.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">No se encontraron libros</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                    {book.imageBase64 ? (
                      <img
                        src={getImageSrc(book.imageBase64) || ''}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">📖</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEditBook(book)}
                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                        title="Editar libro"
                      >
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book)}
                        disabled={isDeleting === book.id}
                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Eliminar libro"
                      >
                        {isDeleting === book.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {book.author.name}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {book.genre.name}
                      </span>
                      <span className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.stock > 0 ? `Stock: ${book.stock}` : 'Agotado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xl font-bold text-gray-900">
                        {formattedPrice(book.price)}
                      </span>
             
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Página {page} de {pagination?.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === (pagination?.totalPages || 1)}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
</>
        )}
      </div>

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        book={selectedBook}
      />
    </div>
  );
}
