import { useState, useEffect } from 'react';
import { Book, BookFilters, PaginatedResponse } from '../types/book';
import { bookService } from '../services/book.service';

export function useBooks(filters?: BookFilters) {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Book>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getBooks(filters);
      // Validar respuesta
      if (response && typeof response === 'object') {
        setBooks(Array.isArray(response.data) ? response.data : []);
        setPagination(response.meta || null);
      } else {
        setBooks([]);
        setPagination(null);
        setError('Respuesta de libros inválida');
      }
    } catch (err) {
      console.error('Error en useBooks:', err);
      setBooks([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : 'Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [JSON.stringify(filters)]);

  return { books, pagination, loading, error, refetch: fetchBooks };
}

export function useBook(id: string | null) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setBook(null);
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookService.getBookById(id);
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar libro');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  return { book, loading, error };
}
