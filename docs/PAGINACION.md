# Sistema de Paginación

Este documento explica cómo usar el sistema de paginación implementado para manejar grandes volúmenes de datos.

## Características

- **Reutilizable**: Fácil de aplicar a cualquier endpoint
- **Validación automática**: Parámetros validados y normalizados
- **Límites seguros**: Máximo 100 items por página para proteger el servidor
- **Metadata completa**: Información de navegación en cada respuesta
- **Retrocompatible**: Los endpoints sin parámetros de paginación siguen funcionando igual

## Uso en el Frontend/Cliente

### Ejemplo básico - Primera página
```bash
GET /api/empresas?page=1&limit=10
```

### Ejemplo con ordenamiento
```bash
GET /api/empresas?page=1&limit=20&sortBy=nombre&sortOrder=asc
```

### Parámetros disponibles

| Parámetro | Tipo | Descripción | Default | Límites |
|-----------|------|-------------|---------|---------|
| `page` | number | Número de página (base 1) | 1 | ≥ 1 |
| `limit` | number | Items por página | 10 | 1-100 |
| `sortBy` | string | Campo por el que ordenar | 'id' | Cualquier campo de la tabla |
| `sortOrder` | string | Orden ascendente o descendente | 'asc' | 'asc' o 'desc' |

### Respuesta paginada

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "nombre": "Empresa A",
      "pais": "Chile",
      "correo_contacto": "contacto@empresaa.com",
      "estado_empresa": "activa",
      "fecha_registro": "2025-11-01T10:00:00Z"
    },
    {
      "id": "uuid-2",
      "nombre": "Empresa B",
      "pais": "Argentina",
      "correo_contacto": "info@empresab.com",
      "estado_empresa": "activa",
      "fecha_registro": "2025-11-02T14:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Campos de Metadata

- **currentPage**: Página actual solicitada
- **pageSize**: Número de items por página
- **totalItems**: Total de items en toda la base de datos
- **totalPages**: Total de páginas disponibles
- **hasNextPage**: `true` si hay una página siguiente
- **hasPreviousPage**: `true` si hay una página anterior

## Implementación para nuevos endpoints

### 1. Importar utilidades en el servicio

```typescript
import {
  validatePaginationParams,
  buildPaginatedResponse,
  applySupabasePagination,
  type PaginationParams,
  type PaginatedResponse,
} from '../utils/pagination';
```

### 2. Crear función paginada en el servicio

```typescript
export async function getMiEntidadPaginated(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const validated = validatePaginationParams(params);

  // Obtener el total (para metadata)
  const { count, error: countError } = await supabase
    .from('mi_tabla')
    .select('*', { count: 'exact', head: true });

  if (countError) throw countError;

  const totalItems = count || 0;

  // Obtener datos paginados
  let query = supabase.from('mi_tabla').select('*');
  query = applySupabasePagination(query, validated);

  const { data, error } = await query;

  if (error) throw error;

  return buildPaginatedResponse(data || [], validated.page, validated.limit, totalItems);
}
```

### 3. Actualizar ruta para aceptar parámetros

```typescript
router.get('/mi-endpoint', async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    // Opción 1: Solo paginado
    const result = await getMiEntidadPaginated({
      page: page as string | undefined,
      limit: limit as string | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    return res.status(200).json({ success: true, ...result });

    // Opción 2: Retrocompatible (sin parámetros = sin paginación)
    if (!page && !limit) {
      const datos = await getMiEntidadTodos();
      return res.status(200).json({ success: true, data: datos });
    }

    const result = await getMiEntidadPaginated({...});
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Error interno' 
    });
  }
});
```

## Ejemplos de uso con cURL

```bash
# Primera página con 10 items
curl "http://localhost:3000/api/empresas?page=1&limit=10"

# Página 3 con 25 items
curl "http://localhost:3000/api/empresas?page=3&limit=25"

# Ordenar por nombre descendente
curl "http://localhost:3000/api/empresas?page=1&limit=10&sortBy=nombre&sortOrder=desc"

# Ordenar por fecha de registro más reciente
curl "http://localhost:3000/api/empresas?page=1&limit=20&sortBy=fecha_registro&sortOrder=desc"
```

## Ejemplos con JavaScript/Fetch

```javascript
// Función auxiliar para construir URL con parámetros
function buildPaginatedUrl(baseUrl, { page = 1, limit = 10, sortBy, sortOrder } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  
  return `${baseUrl}?${params.toString()}`;
}

// Usar la función
const url = buildPaginatedUrl('/api/empresas', { 
  page: 1, 
  limit: 20, 
  sortBy: 'nombre',
  sortOrder: 'asc'
});

const response = await fetch(url);
const { data, meta } = await response.json();

console.log(`Mostrando ${data.length} de ${meta.totalItems} empresas`);
console.log(`Página ${meta.currentPage} de ${meta.totalPages}`);

// Navegar a la siguiente página
if (meta.hasNextPage) {
  const nextUrl = buildPaginatedUrl('/api/empresas', { 
    page: meta.currentPage + 1, 
    limit: meta.pageSize 
  });
  // fetch(nextUrl)...
}
```

## Ejemplos con React

```typescript
import { useState, useEffect } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function EmpresasTable() {
  const [empresas, setEmpresas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const fetchEmpresas = async () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);

      const response = await fetch(`/api/empresas?${params}`);
      const result = await response.json();
      
      setEmpresas(result.data);
      setMeta(result.meta);
    };

    fetchEmpresas();
  }, [pagination]);

  return (
    <div>
      <table>
        {/* Renderizar empresas */}
      </table>
      
      <div className="pagination">
        <button 
          disabled={!meta?.hasPreviousPage}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Anterior
        </button>
        
        <span>Página {meta?.currentPage} de {meta?.totalPages}</span>
        
        <button 
          disabled={!meta?.hasNextPage}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

## Consideraciones de Rendimiento

1. **Índices de Base de Datos**: Asegúrate de crear índices en las columnas usadas para `sortBy`
   ```sql
   CREATE INDEX idx_empresa_nombre ON empresa(nombre);
   CREATE INDEX idx_empresa_fecha_registro ON empresa(fecha_registro);
   ```

2. **Límite máximo**: El sistema limita automáticamente a 100 items por página para evitar sobrecarga

3. **Caché**: Para grandes volúmenes, considera implementar caché de resultados frecuentes

4. **Total count**: La consulta de `count` puede ser costosa en tablas muy grandes. Considera cachear o aproximar este valor

## Troubleshooting

### Error: "totalItems es 0 pero hay datos"
Verifica que la consulta `count` tenga el mismo filtro que la consulta de datos.

### Error: "No se aplica el ordenamiento"
Asegúrate de que el campo `sortBy` exista en la tabla y esté escrito correctamente.

### Respuesta sin metadata
Verifica que estés pasando parámetros `page` o `limit` en la URL. Sin ellos, usa el método sin paginación.
