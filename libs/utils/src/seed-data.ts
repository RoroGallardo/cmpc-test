export const SEED_GENRES = [
  { name: 'Ficción', description: 'Obras de ficción literaria' },
  { name: 'No Ficción', description: 'Obras basadas en hechos reales' },
  { name: 'Ciencia Ficción', description: 'Ficción científica y futurista' },
  { name: 'Fantasía', description: 'Mundos fantásticos y mágicos' },
  { name: 'Terror', description: 'Literatura de terror y suspense' },
  { name: 'Romance', description: 'Novelas románticas' },
  { name: 'Thriller', description: 'Suspenso y misterio' },
  { name: 'Historia', description: 'Libros históricos' },
];

export const SEED_AUTHORS = [
  {
    name: 'Gabriel García Márquez',
    birthYear: 1927,
    biography: 'Escritor colombiano, premio Nobel de Literatura',
  },
  {
    name: 'Isabel Allende',
    birthYear: 1942,
    biography: 'Escritora chilena de renombre internacional',
  },
  {
    name: 'Jorge Luis Borges',
    birthYear: 1899,
    biography: 'Escritor argentino, maestro del cuento corto',
  },
  {
    name: 'Pablo Neruda',
    birthYear: 1904,
    biography: 'Poeta chileno, premio Nobel de Literatura',
  },
  {
    name: 'Julio Cortázar',
    birthYear: 1914,
    biography: 'Escritor argentino, exponente del boom latinoamericano',
  },
  {
    name: 'Mario Vargas Llosa',
    birthYear: 1936,
    biography: 'Escritor peruano, premio Nobel de Literatura',
  },
  {
    name: 'Laura Esquivel',
    birthYear: 1950,
    biography: 'Escritora mexicana',
  },
  {
    name: 'Roberto Bolaño',
    birthYear: 1953,
    biography: 'Escritor chileno',
  },
];

export const SEED_PUBLISHERS = [
  { name: 'Sudamericana', country: 'Argentina', website: 'www.sudamericana.com' },
  { name: 'Planeta', country: 'España', website: 'www.planeta.es' },
  { name: 'Alfaguara', country: 'España', website: 'www.alfaguara.com' },
  { name: 'Anagrama', country: 'España', website: 'www.anagrama-ed.es' },
  { name: 'Seix Barral', country: 'España', website: 'www.seixbarral.com' },
];

export interface SeedBook {
  title: string;
  price: number;
  available: boolean;
  authorIndex: number;
  publisherIndex: number;
  genreIndex: number;
  imageUrl: string;
}

export const SEED_BOOKS: SeedBook[] = [
  {
    title: 'Cien años de soledad',
    price: 29.99,
    available: true,
    authorIndex: 0,
    publisherIndex: 0,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/cien/400/600',
  },
  {
    title: 'La casa de los espíritus',
    price: 24.99,
    available: true,
    authorIndex: 1,
    publisherIndex: 1,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/casa/400/600',
  },
  {
    title: 'Ficciones',
    price: 19.99,
    available: true,
    authorIndex: 2,
    publisherIndex: 2,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/ficc/400/600',
  },
  {
    title: 'Veinte poemas de amor',
    price: 15.99,
    available: false,
    authorIndex: 3,
    publisherIndex: 0,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/veinte/400/600',
  },
  {
    title: 'Rayuela',
    price: 27.99,
    available: true,
    authorIndex: 4,
    publisherIndex: 0,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/rayuela/400/600',
  },
  {
    title: 'La ciudad y los perros',
    price: 22.99,
    available: true,
    authorIndex: 5,
    publisherIndex: 4,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/ciudad/400/600',
  },
  {
    title: 'Como agua para chocolate',
    price: 18.99,
    available: true,
    authorIndex: 6,
    publisherIndex: 1,
    genreIndex: 5,
    imageUrl: 'https://picsum.photos/seed/agua/400/600',
  },
  {
    title: '2666',
    price: 32.99,
    available: true,
    authorIndex: 7,
    publisherIndex: 3,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/2666/400/600',
  },
  {
    title: 'El amor en los tiempos del cólera',
    price: 26.99,
    available: true,
    authorIndex: 0,
    publisherIndex: 0,
    genreIndex: 5,
    imageUrl: 'https://picsum.photos/seed/amor/400/600',
  },
  {
    title: 'Eva Luna',
    price: 21.99,
    available: true,
    authorIndex: 1,
    publisherIndex: 1,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/eva/400/600',
  },
  {
    title: 'El Aleph',
    price: 17.99,
    available: false,
    authorIndex: 2,
    publisherIndex: 2,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/aleph/400/600',
  },
  {
    title: 'Bestiario',
    price: 20.99,
    available: true,
    authorIndex: 4,
    publisherIndex: 0,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/best/400/600',
  },
  {
    title: 'Conversación en La Catedral',
    price: 28.99,
    available: true,
    authorIndex: 5,
    publisherIndex: 4,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/conver/400/600',
  },
  {
    title: 'Los detectives salvajes',
    price: 31.99,
    available: true,
    authorIndex: 7,
    publisherIndex: 3,
    genreIndex: 0,
    imageUrl: 'https://picsum.photos/seed/detec/400/600',
  },
  {
    title: 'Paula',
    price: 23.99,
    available: true,
    authorIndex: 1,
    publisherIndex: 1,
    genreIndex: 1,
    imageUrl: 'https://picsum.photos/seed/paula/400/600',
  },
];
