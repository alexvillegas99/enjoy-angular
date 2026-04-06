# Guia de Linea Grafica y Sistema de Diseno - AguaPlus

## 1. Look & Feel (Concepto Visual)
- **Estilo**: "Flat Design" evolucionado con toques sutiles de profundidad ("Soft UI")
- **Contraste**: Alto contraste. Choque visual entre bloques solidos de color oscuro y espacios limpios y luminosos
- **Sensacion**: Profesional, analitica, limpia y moderna

## 2. Paleta de Colores

### Colores Principales (Brand Colors)
| Color | Hex | Uso Principal |
|-------|-----|---------------|
| Azul Profundo | `#152A47` | Fondos de menus, barras de navegacion, botones secundarios, headers |
| Naranja Acento | `#FF9F1C` | Botones CTA, iconos destacados, estados activos, barras de progreso |
| Amarillo Acento | `#FFBF46` | Graficos, estrellas de calificacion, gradientes sutiles junto al naranja |

### Colores Neutros (Superficies y Fondos)
| Color | Hex | Uso Principal |
|-------|-----|---------------|
| Gris Base (Fondo) | `#EFF2F7` | Fondo principal de la aplicacion |
| Blanco | `#FFFFFF` | Fondo de contenedores, tarjetas y areas de contenido |

### Colores de Texto
| Color | Hex | Uso Principal |
|-------|-----|---------------|
| Gris Oscuro | `#333333` | Titulos principales (H1, H2), numeros grandes |
| Gris Medio | `#7A869A` | Texto de cuerpo, subtitulos, etiquetas, placeholders |
| Blanco | `#FFFFFF` | Texto e iconos sobre fondos Azul Profundo o Naranja |

## 3. Tipografia
- **Fuente**: Roboto (incluida en Flutter por defecto)
- **Titulos (H1/H2)**: 24-32px, Semi-Bold, Color Gris Oscuro
- **Numeros/Metricas**: 36-48px, Regular/Light
- **Texto de Cuerpo**: 14-16px, Regular, Color Gris Medio
- **Labels**: 10-12px, Regular

## 4. Estilo de Componentes

### A. Tarjetas (Cards)
- Fondo: `#FFFFFF`
- Sin bordes visibles
- Border Radius: `8px`
- Sombra: `box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05)`

### B. Botones
- **Primario (CTA)**: Fondo `#FF9F1C`, texto blanco, pill shape (`border-radius: 20px`)
- **Secundario**: Fondo `#152A47`, texto/icono blanco

### C. Iconografia
- Estilo: **Solidos (Filled)**, no outlined
- Color: Blanco sobre fondos oscuros, Naranja en tarjetas blancas
- Tamano: Proporcionalmente pequenos

### D. Avatares
- Circulares (`border-radius: 50%`)
- Contenedor circular mas oscuro sobre fondo azul marino

### E. Graficos
- Colores solidos y planos (Azul Profundo y Naranja)
- Gradientes sutiles desde color solido hasta transparente

## 5. Espaciado
- **Padding interno**: Minimo 16-24px en cada tarjeta
- **Separacion entre elementos**: Sistema base de 8px (16, 24, 32px entre tarjetas)
