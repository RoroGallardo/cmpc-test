
export const SWAGGER_EXAMPLES = {
  // Auth Examples
  login: {
    simple: {
      email: 'usuario@example.com',
      password: 'password123',
    },
    admin: {
      email: 'admin@cmpc.com',
      password: 'Admin123!',
    },
  },
  
  register: {
    simple: {
      email: 'nuevo@example.com',
      password: 'Password123!',
      name: 'Juan Pérez',
    },
  },

  // Books Examples
  filterBook: {
    simple: {
      search: 'soledad',
      page: 1,
      limit: 10,
    },
    complete: {
      search: 'amor',
      genreId: 'c1234567-89ab-cdef-0123-456789abcdef',
      authorId: 'a1234567-89ab-cdef-0123-456789abcdef',
      publisherId: 'b1234567-89ab-cdef-0123-456789abcdef',
      available: true,
      page: 1,
      limit: 10,
      sortBy: 'price',
      sortOrder: 'ASC' as const,
    },
    onlyAvailable: {
      available: true,
      page: 1,
      limit: 20,
      sortBy: 'title',
      sortOrder: 'ASC' as const,
    },
    byGenre: {
      genreId: 'c1234567-89ab-cdef-0123-456789abcdef',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    },
  },

  createBook: {
    simple: {
      title: 'Cien años de soledad',
      price: 29.99,
      available: true,
      authorId: 'a1234567-89ab-cdef-0123-456789abcdef',
      publisherId: 'b1234567-89ab-cdef-0123-456789abcdef',
      genreId: 'c1234567-89ab-cdef-0123-456789abcdef',
      imageUrl: 'https://picsum.photos/seed/cien/400/600',
    },
  },

  updateBook: {
    simple: {
      title: 'Cien años de soledad (Edición especial)',
      price: 34.99,
      available: false,
    },
  },

  // Authors Examples
  createAuthor: {
    simple: {
      name: 'Gabriel García Márquez',
      birthYear: 1927,
      biography: 'Escritor colombiano, premio Nobel de Literatura 1982',
    },
  },

  updateAuthor: {
    simple: {
      biography: 'Escritor colombiano, premio Nobel de Literatura 1982. Autor de Cien años de soledad.',
    },
  },

  // Genres Examples
  createGenre: {
    simple: {
      name: 'Ficción',
      description: 'Obras de ficción literaria',
    },
  },

  updateGenre: {
    simple: {
      description: 'Obras de ficción literaria y narrativa',
    },
  },

  // Publishers Examples
  createPublisher: {
    simple: {
      name: 'Sudamericana',
      country: 'Argentina',
      website: 'www.sudamericana.com',
    },
  },

  updatePublisher: {
    simple: {
      website: 'www.sudamericana.com.ar',
    },
  },
};

// Ejemplos para Response de Swagger Documentation

export const SWAGGER_RESPONSE_EXAMPLES = {
  // Auth Responses
  auth: {
    loginSuccess: {
      access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'a1234567-89ab-cdef-0123-456789abcdef',
        email: 'usuario@example.com',
        name: 'Juan Pérez',
        role: 'user'
      }
    },
    registerSuccess: {
      access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'a1234567-89ab-cdef-0123-456789abcdef',
        email: 'nuevo@example.com',
        name: 'Juan Pérez',
        role: 'user'
      }
    },
    profile: {
      id: 'a1234567-89ab-cdef-0123-456789abcdef',
      email: 'usuario@example.com',
      name: 'Juan Pérez',
      role: 'user'
    }
  },

  // Books Responses
  books: {
    searchSuccess: {
      data: [
        {
          id: 'a1234567-89ab-cdef-0123-456789abcdef',
          title: 'Cien años de soledad',
          price: 29.99,
          available: true,
          imageUrl: 'https://example.com/book.jpg',
          author: { id: 'xxx', name: 'Gabriel García Márquez' },
          publisher: { id: 'yyy', name: 'Sudamericana' },
          genre: { id: 'zzz', name: 'Ficción' }
        }
      ],
      meta: {
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2
      }
    }
  }
};
