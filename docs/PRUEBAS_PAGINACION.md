# Pruebas de Paginación - Endpoint /api/empresas

## Pruebas manuales con cURL

### 1. Sin paginación (retrocompatible)
```bash
curl http://localhost:3000/api/empresas
```
**Resultado esperado**: Array de todas las empresas sin metadata de paginación.

---

### 2. Primera página con 5 items
```bash
curl "http://localhost:3000/api/empresas?page=1&limit=5"
```
**Resultado esperado**: 
```json
{
  "success": true,
  "data": [...],  // 5 empresas máximo
  "meta": {
    "currentPage": 1,
    "pageSize": 5,
    "totalItems": X,
    "totalPages": Y,
    "hasNextPage": true/false,
    "hasPreviousPage": false
  }
}
```

---

### 3. Segunda página con 10 items
```bash
curl "http://localhost:3000/api/empresas?page=2&limit=10"
```

---

### 4. Ordenar por nombre ascendente
```bash
curl "http://localhost:3000/api/empresas?page=1&limit=10&sortBy=nombre&sortOrder=asc"
```

---

### 5. Ordenar por fecha de registro (más reciente primero)
```bash
curl "http://localhost:3000/api/empresas?page=1&limit=10&sortBy=fecha_registro&sortOrder=desc"
```

---

### 6. Límite máximo (100 items)
```bash
curl "http://localhost:3000/api/empresas?page=1&limit=150"
```
**Resultado esperado**: Solo 100 items máximo (límite de seguridad).

---

### 7. Página inválida (se normaliza a 1)
```bash
curl "http://localhost:3000/api/empresas?page=0&limit=10"
```
**Resultado esperado**: Se normaliza a página 1.

---

### 8. Límite inválido (se normaliza a 10)
```bash
curl "http://localhost:3000/api/empresas?page=1&limit=abc"
```
**Resultado esperado**: Se normaliza a limit=10.

---

## Prueba con Postman / Thunder Client

### GET Request
- **URL**: `http://localhost:3000/api/empresas`
- **Query Params**:
  - `page`: 1
  - `limit`: 10
  - `sortBy`: nombre
  - `sortOrder`: asc

---

## Script de prueba con Node.js

Crea un archivo `test-pagination.js`:

```javascript
async function testPagination() {
  const baseUrl = 'http://localhost:3000/api/empresas';
  
  console.log('🧪 Prueba 1: Sin paginación');
  const res1 = await fetch(baseUrl);
  const data1 = await res1.json();
  console.log(`✅ Devuelve ${data1.data.length} empresas\n`);
  
  console.log('🧪 Prueba 2: Primera página con 5 items');
  const res2 = await fetch(`${baseUrl}?page=1&limit=5`);
  const data2 = await res2.json();
  console.log(`✅ Página ${data2.meta.currentPage} de ${data2.meta.totalPages}`);
  console.log(`✅ Total: ${data2.meta.totalItems} empresas`);
  console.log(`✅ Datos: ${data2.data.length} empresas\n`);
  
  console.log('🧪 Prueba 3: Navegación a siguiente página');
  if (data2.meta.hasNextPage) {
    const res3 = await fetch(`${baseUrl}?page=2&limit=5`);
    const data3 = await res3.json();
    console.log(`✅ Página 2 devuelve ${data3.data.length} empresas\n`);
  } else {
    console.log('⚠️  No hay página siguiente\n');
  }
  
  console.log('🧪 Prueba 4: Ordenamiento por nombre');
  const res4 = await fetch(`${baseUrl}?page=1&limit=5&sortBy=nombre&sortOrder=asc`);
  const data4 = await res4.json();
  const nombres = data4.data.map(e => e.nombre);
  console.log(`✅ Empresas ordenadas: ${nombres.join(', ')}\n`);
}

testPagination().catch(console.error);
```

Ejecutar:
```bash
node test-pagination.js
```

---

## Verificaciones importantes

### ✅ Checklist de funcionalidad
- [ ] Sin parámetros devuelve todas las empresas (retrocompatible)
- [ ] Con `page=1&limit=10` devuelve máximo 10 items
- [ ] La metadata incluye `totalItems`, `totalPages`, etc.
- [ ] `hasNextPage` es `true` cuando hay más páginas
- [ ] `hasPreviousPage` es `false` en la primera página
- [ ] `sortBy=nombre&sortOrder=asc` ordena correctamente
- [ ] `sortBy=fecha_registro&sortOrder=desc` ordena correctamente
- [ ] Límites mayores a 100 se reducen a 100
- [ ] Valores inválidos se normalizan (página 0 → 1, limit abc → 10)

---

## Próximos pasos

Para aplicar paginación a otros endpoints:
1. Ver `src/utils/pagination.ts` para las funciones auxiliares
2. Ver `src/services/empresaService.ts` función `getEmpresasPaginated` como ejemplo
3. Ver `src/routes/empresaRoutes.ts` ruta GET `/empresas` como ejemplo
4. Consultar `docs/PAGINACION.md` para la guía completa

---

## Benchmarks (opcional)

Para medir rendimiento con grandes volúmenes:

```javascript
// Crear muchas empresas de prueba primero
for (let i = 0; i < 1000; i++) {
  await fetch('http://localhost:3000/api/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: `Empresa Test ${i}`,
      pais: 'Chile',
      correo_contacto: `test${i}@example.com`
    })
  });
}

// Medir tiempo de respuesta con paginación
console.time('Página 1 (10 items)');
await fetch('http://localhost:3000/api/empresas?page=1&limit=10');
console.timeEnd('Página 1 (10 items)');

console.time('Página 50 (10 items)');
await fetch('http://localhost:3000/api/empresas?page=50&limit=10');
console.timeEnd('Página 50 (10 items)');

console.time('Sin paginación (todas)');
await fetch('http://localhost:3000/api/empresas');
console.timeEnd('Sin paginación (todas)');
```
