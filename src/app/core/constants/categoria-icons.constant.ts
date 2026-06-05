export interface CategoriaIconOption {
  key: string;
  label: string;
}

export const CATEGORIA_ICON_OPTIONS: CategoriaIconOption[] = [
  // Gastronomía y bebidas
  { key: 'restaurant', label: 'Restaurante' },
  { key: 'fastfood', label: 'Comida rápida' },
  { key: 'pizza', label: 'Pizza' },
  { key: 'burger', label: 'Hamburguesa' },
  { key: 'parrillada', label: 'Parrillada / BBQ' },
  { key: 'mariscos', label: 'Mariscos' },
  { key: 'sushi', label: 'Sushi' },
  { key: 'saludable', label: 'Comida saludable' },
  { key: 'heladeria', label: 'Heladería' },
  { key: 'postres', label: 'Postres / Pastelería' },
  { key: 'panaderia', label: 'Panadería' },
  { key: 'coffee', label: 'Café' },
  { key: 'bar', label: 'Bar' },
  { key: 'disco', label: 'Discoteca' },
  { key: 'licoreria', label: 'Licorería' },
  { key: 'foodtruck', label: 'Food truck' },
  { key: 'buffet', label: 'Buffet' },

  // Belleza y bienestar
  { key: 'spa', label: 'Spa' },
  { key: 'hair', label: 'Peluquería' },
  { key: 'beauty', label: 'Salón de belleza' },
  { key: 'nails', label: 'Manicure / Pedicure' },
  { key: 'masajes', label: 'Masajes' },
  { key: 'maquillaje', label: 'Maquillaje' },
  { key: 'depilacion', label: 'Depilación' },
  { key: 'tatuajes', label: 'Tatuajes / Piercing' },

  // Salud
  { key: 'pharmacy', label: 'Farmacia' },
  { key: 'clinica', label: 'Clínica' },
  { key: 'dentista', label: 'Odontología' },
  { key: 'optica', label: 'Óptica' },
  { key: 'laboratorio', label: 'Laboratorio' },
  { key: 'psicologia', label: 'Psicología' },
  { key: 'nutricion', label: 'Nutrición' },
  { key: 'veterinaria', label: 'Veterinaria' },

  // Deporte y fitness
  { key: 'deportes', label: 'Deportes (general)' },
  { key: 'gym', label: 'Gimnasio' },
  { key: 'yoga', label: 'Yoga / Pilates' },
  { key: 'crossfit', label: 'CrossFit' },
  { key: 'marciales', label: 'Artes marciales' },
  { key: 'natacion', label: 'Natación' },
  { key: 'tenis', label: 'Tenis' },
  { key: 'futbol', label: 'Fútbol' },
  { key: 'basquet', label: 'Básquet' },
  { key: 'bike', label: 'Ciclismo' },
  { key: 'running', label: 'Running' },

  // Aventura y outdoor
  { key: 'aventura', label: 'Aventura' },
  { key: 'trekking', label: 'Senderismo / Trekking' },
  { key: 'camping', label: 'Camping' },
  { key: 'escalada', label: 'Escalada' },
  { key: 'parapente', label: 'Parapente' },
  { key: 'rafting', label: 'Rafting' },
  { key: 'buceo', label: 'Buceo / Snorkel' },
  { key: 'surf', label: 'Surf' },
  { key: 'pesca', label: 'Pesca deportiva' },
  { key: 'kayak', label: 'Kayak' },
  { key: 'equitacion', label: 'Equitación' },
  { key: 'atv', label: 'Cuatrimotos / ATV' },
  { key: 'paintball', label: 'Paintball' },
  { key: 'canopy', label: 'Tirolesa / Canopy' },

  // Turismo y viajes
  { key: 'hotel', label: 'Hotel' },
  { key: 'hostal', label: 'Hostal' },
  { key: 'resort', label: 'Resort' },
  { key: 'cabana', label: 'Cabañas' },
  { key: 'agencia', label: 'Agencia de viaje' },
  { key: 'tours', label: 'Tours' },
  { key: 'beach', label: 'Playa' },
  { key: 'termas', label: 'Termas' },
  { key: 'aerolinea', label: 'Aerolínea' },

  // Entretenimiento
  { key: 'cinema', label: 'Cine' },
  { key: 'theater', label: 'Teatro' },
  { key: 'concierto', label: 'Conciertos' },
  { key: 'karaoke', label: 'Karaoke' },
  { key: 'bowling', label: 'Bowling' },
  { key: 'billar', label: 'Billar' },
  { key: 'game', label: 'Videojuegos' },
  { key: 'casino', label: 'Casino' },
  { key: 'parquediv', label: 'Parque de diversiones' },
  { key: 'acuario', label: 'Acuario' },
  { key: 'zoo', label: 'Zoológico' },
  { key: 'museum', label: 'Museo' },
  { key: 'galeria', label: 'Galería de arte' },
  { key: 'escape', label: 'Escape room' },
  { key: 'eventos', label: 'Eventos / Festivales' },

  // Niños y familia
  { key: 'jugueteria', label: 'Juguetería' },
  { key: 'parqueinf', label: 'Parque infantil' },
  { key: 'guarderia', label: 'Guardería' },
  { key: 'ropainf', label: 'Ropa infantil' },

  // Educación
  { key: 'cursos', label: 'Cursos / Capacitaciones' },
  { key: 'idiomas', label: 'Idiomas' },
  { key: 'music', label: 'Música' },
  { key: 'arte', label: 'Arte / Pintura' },
  { key: 'book', label: 'Librería' },

  // Compras y retail
  { key: 'mall', label: 'Centro comercial' },
  { key: 'market', label: 'Supermercado' },
  { key: 'ropa', label: 'Ropa / Boutique' },
  { key: 'calzado', label: 'Calzado' },
  { key: 'joyeria', label: 'Joyería' },
  { key: 'accesorios', label: 'Accesorios' },
  { key: 'electro', label: 'Electrodomésticos' },
  { key: 'tech', label: 'Tecnología / Electrónica' },
  { key: 'phone', label: 'Celulares' },
  { key: 'computer', label: 'Computadoras' },
  { key: 'muebles', label: 'Muebles' },
  { key: 'hogar', label: 'Decoración / Hogar' },
  { key: 'flores', label: 'Florería' },
  { key: 'petshop', label: 'Pet shop' },
  { key: 'regalos', label: 'Regalos' },
  { key: 'shop', label: 'Tienda general' },

  // Servicios
  { key: 'lavanderia', label: 'Lavandería' },
  { key: 'tintoreria', label: 'Tintorería' },
  { key: 'lavadoauto', label: 'Lavado de autos' },
  { key: 'mecanica', label: 'Mecánica / Taller' },
  { key: 'llantera', label: 'Llantera' },
  { key: 'cerrajeria', label: 'Cerrajería' },
  { key: 'plomeria', label: 'Plomería' },
  { key: 'electricista', label: 'Electricista' },
  { key: 'limpieza', label: 'Limpieza / Aseo' },
  { key: 'mudanza', label: 'Mudanzas' },
  { key: 'mensajeria', label: 'Mensajería' },
  { key: 'imprenta', label: 'Imprenta' },
  { key: 'fotografia', label: 'Fotografía' },
  { key: 'catering', label: 'Catering / Eventos' },
  { key: 'dj', label: 'DJ / Música eventos' },

  // Transporte
  { key: 'taxi', label: 'Taxi' },
  { key: 'bus', label: 'Bus' },
  { key: 'rentauto', label: 'Renta de autos' },
  { key: 'rentamoto', label: 'Renta de motos' },
  { key: 'rentabike', label: 'Renta de bicicletas' },

  // Inmobiliario y construcción
  { key: 'inmobiliaria', label: 'Bienes raíces' },
  { key: 'construccion', label: 'Construcción' },
  { key: 'arquitectura', label: 'Arquitectura' },
  { key: 'interiores', label: 'Diseño de interiores' },

  // Financieros
  { key: 'banco', label: 'Banco' },
  { key: 'seguros', label: 'Seguros' },
  { key: 'cambio', label: 'Casa de cambio' },

  // Mascotas (servicios)
  { key: 'pelucanina', label: 'Peluquería canina' },
  { key: 'adiestramiento', label: 'Adiestramiento' },
  { key: 'hotelpet', label: 'Hotel para mascotas' },
];
