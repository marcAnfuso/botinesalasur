import { Product, Category } from "@/types";

export const categories: Category[] = [
  {
    id: "1",
    name: "Fútsal",
    slug: "futsal",
    description: "Botines para fútsal / indoor",
  },
  {
    id: "2",
    name: "Sintético",
    slug: "sintetico",
    description: "Botines para césped sintético",
  },
  {
    id: "3",
    name: "Fútbol 11",
    slug: "futbol11",
    description: "Botines para césped natural",
  },
  {
    id: "4",
    name: "Accesorios",
    slug: "accesorios",
    description: "Medias, canilleras y más",
  },
];

// Datos importados desde STOCK DISPONIBLE.xlsx
export const products: Product[] = [
  {
    "id": "1",
    "name": "LUNAR GATO BLANCO Y VERDE",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "1-0",
        "size": "22,5 CM (niño)",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "2",
    "name": "LUNAR GATO BLANCO SUELA ROJA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": true,
    "active": true,
    "variants": [
      {
        "id": "2-0",
        "size": "22,5 CM(niño)",
        "stock": 1
      },
      {
        "id": "2-1",
        "size": "7US",
        "stock": 0
      },
      {
        "id": "2-2",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "3",
    "name": "LUNAR GATO BLANCO SUELA NARANJA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "3-0",
        "size": "22,5 CM (niño)",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "4",
    "name": "STREET GATO NEGRO NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "4-0",
        "size": "4US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "5",
    "name": "PREMIER SUELA DE COLORES NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "5-0",
        "size": "5.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "6",
    "name": "STREET GATO SUELA AZUL",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "6-0",
        "size": "6.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "7",
    "name": "ADIZERO NARANJA",
    "brand": "Adidas",
    "description": "Botín Adidas para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/nike-2.jpg",
    "featured": true,
    "active": true,
    "variants": [
      {
        "id": "7-0",
        "size": "6.5US",
        "stock": 1
      },
      {
        "id": "7-1",
        "size": "7US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "8",
    "name": "STREET GATO NEGRO Y VIOLETA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "8-0",
        "size": "6.5US",
        "stock": 1
      },
      {
        "id": "8-1",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "9",
    "name": "STREET GATO BLANCO PIPETA AZUL",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "9-0",
        "size": "6.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "10",
    "name": "PHANTOM NARANJA",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/fg-1.jpg",
    "featured": true,
    "active": true,
    "variants": [
      {
        "id": "10-0",
        "size": "6.5US",
        "stock": 1
      },
      {
        "id": "10-1",
        "size": "8US",
        "stock": 1
      },
      {
        "id": "10-2",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "11",
    "name": "TIEMPO LEGEND NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "11-0",
        "size": "6,5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "12",
    "name": "STREET GATO GRIS Y BLANCO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "12-0",
        "size": "7US",
        "stock": 0
      },
      {
        "id": "12-1",
        "size": "8US",
        "stock": 1
      },
      {
        "id": "12-2",
        "size": "8.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "13",
    "name": "GATO SUPRIME SB ROJO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "13-0",
        "size": "7US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "14",
    "name": "STREET GATO ROJO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "14-0",
        "size": "7US",
        "stock": 1
      },
      {
        "id": "14-1",
        "size": "8.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "15",
    "name": "TIEMPO FLUOR",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "15-0",
        "size": "7US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "16",
    "name": "TIEMPO CELESTE",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/nike-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "16-0",
        "size": "7US",
        "stock": 1
      },
      {
        "id": "16-1",
        "size": "8US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "17",
    "name": "COPA NEGRO",
    "brand": "Adidas",
    "description": "Botín Adidas para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": true,
    "active": true,
    "variants": [
      {
        "id": "17-0",
        "size": "7US",
        "stock": 1
      },
      {
        "id": "17-1",
        "size": "8.5US",
        "stock": 1
      },
      {
        "id": "17-2",
        "size": "9.5US",
        "stock": 0
      },
      {
        "id": "17-3",
        "size": "11US",
        "stock": 0
      },
      {
        "id": "17-4",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "18",
    "name": "PREMIER VERDE PIPETA BLANCA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "18-0",
        "size": "7US",
        "stock": 2
      },
      {
        "id": "18-1",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "19",
    "name": "STREET GATO NEGRO SUELA BLANCA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "19-0",
        "size": "7US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "20",
    "name": "COPA ROJO",
    "brand": "Adidas",
    "description": "Botín Adidas para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "20-0",
        "size": "7US",
        "stock": 1
      },
      {
        "id": "20-1",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "21",
    "name": "AIR ZOOM BLANCO",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": true,
    "active": true,
    "variants": [
      {
        "id": "21-0",
        "size": "7US",
        "stock": 1
      },
      {
        "id": "21-1",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "22",
    "name": "LUNAR GATO VERDES FLUOR",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "22-0",
        "size": "25cm",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "23",
    "name": "LUNAR GATO NEGRO Y VIOLETA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "23-0",
        "size": "25cm",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "24",
    "name": "PHANTOM VERDE",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "24-0",
        "size": "8US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "25",
    "name": "REACT GATO BLANCO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "25-0",
        "size": "8US",
        "stock": 1
      },
      {
        "id": "25-1",
        "size": "9.5US",
        "stock": 3
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "26",
    "name": "PHANTOM NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "26-0",
        "size": "8US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "27",
    "name": "STREET GATO BLANCO PIPETA DORADA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "27-0",
        "size": "8US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "28",
    "name": "LUNAR GATO BLANCO SUELA ROJA",
    "brand": "Generic",
    "description": "Botín Generic para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "28-0",
        "size": "8US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "29",
    "name": "LUNAR GATO BLANCO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "29-0",
        "size": "8US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "30",
    "name": "R10 DORADOS",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "30-0",
        "size": "8US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "31",
    "name": "TIEMPO R10 BLANCOS",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "31-0",
        "size": "8.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "32",
    "name": "TIEMPO NEGROS",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/fg-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "32-0",
        "size": "8.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "33",
    "name": "PHANTOM VERDES",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "33-0",
        "size": "8.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "34",
    "name": "TIEMPO LEGEND VIOLETA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "34-0",
        "size": "8.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "35",
    "name": "REACT GATO SALMON",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "35-0",
        "size": "8.5US",
        "stock": 1
      },
      {
        "id": "35-1",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "36",
    "name": "PHANTOM CELESTES",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "36-0",
        "size": "8.5US",
        "stock": 0
      },
      {
        "id": "36-1",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "37",
    "name": "PHANTOM NEGROS",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/fg-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "37-0",
        "size": "8.5US",
        "stock": 1
      },
      {
        "id": "37-1",
        "size": "9.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "38",
    "name": "PHANTOM NEGRO Y ROJO",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/nike-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "38-0",
        "size": "8.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "39",
    "name": "JOMA ROSA",
    "brand": "Generic",
    "description": "Botín Generic para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "39-0",
        "size": "8.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "40",
    "name": "COPA BLANCO",
    "brand": "Adidas",
    "description": "Botín Adidas para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/fg-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "40-0",
        "size": "8.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "41",
    "name": "PHANTOM VIOLETA",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/nike-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "41-0",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "42",
    "name": "STREET GATO VIOLETA CON VERDE",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "42-0",
        "size": "9.5US",
        "stock": 0
      },
      {
        "id": "42-1",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "43",
    "name": "STREET GATO SUELA DE COLOR",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "43-0",
        "size": "9.5US",
        "stock": 1
      },
      {
        "id": "43-1",
        "size": "10US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "44",
    "name": "GATO SUPRIME SB NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "44-0",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "45",
    "name": "TIEMPO NEGRO",
    "brand": "Nike",
    "description": "Botín Nike para césped sintético. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "sintetico",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "45-0",
        "size": "9.5US",
        "stock": 0
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "46",
    "name": "CRAZY FAST NEGRO",
    "brand": "Adidas",
    "description": "Botín Adidas para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/fg-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "46-0",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "47",
    "name": "AIR ZOOM GRISES",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/nike-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "47-0",
        "size": "9.5US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "48",
    "name": "TIEMPO BLANCO",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/sneaker-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "48-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "49",
    "name": "PREMIER BLANCO PIPETA NEGRA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "49-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "50",
    "name": "PREMIER GAMUZA SUELA CELESTE",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "50-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "51",
    "name": "PREDATOR NEGROS",
    "brand": "Adidas",
    "description": "Botín Adidas para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "51-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "52",
    "name": "AIR ZOOM NEGROS",
    "brand": "Nike",
    "description": "Botín Nike para fútbol 11. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futbol11",
    "imageUrl": "/products/fg-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "52-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "53",
    "name": "STREET GATO LILA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "53-0",
        "size": "10US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "54",
    "name": "TIEMPO LEGEND NEGROS PIPETA GRISYAZUL",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/futsal-2.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "54-0",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  },
  {
    "id": "55",
    "name": "PREMIER NEGRO SUELA ROJA",
    "brand": "Nike",
    "description": "Botín Nike para fútsal. Excelente calidad y comodidad.",
    "price": 89999,
    "category": "futsal",
    "imageUrl": "/products/nike-1.jpg",
    "featured": false,
    "active": true,
    "variants": [
      {
        "id": "55-0",
        "size": "11US",
        "stock": 1
      }
    ],
    "createdAt": "2025-11-29"
  }
];

export const brands = ["Nike", "Adidas", "Puma"];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category && p.active);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.active);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}
