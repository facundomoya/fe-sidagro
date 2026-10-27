# SID-Agro — Requisitos funcionales del frontend

## 1. Objetivo

Este documento define las funcionalidades que debe implementar el frontend del Producto Mínimo Viable (PMV) de SID-Agro.

El PMV comprende:
1. Dashboard económico.
2. Simulador de escenarios.
3. Monitoreo de chinche verde.

Las funcionalidades se basan en los casos de uso y requisitos del documento de Análisis y Diseño.

Los prototipos de `docs/prototipos/` son referencias visuales, no especificaciones definitivas de diseño.

## 2. Requisitos generales

### Navegación
- Implementar una estructura visual común con menú lateral y encabezado.
- Permitir navegar entre los tres módulos principales.
- Identificar visualmente el módulo seleccionado.
- Mantener coherencia visual entre las pantallas.

### Interfaz
- Utilizar componentes reutilizables.
- Permitir mejoras visuales sutiles respecto de los prototipos.
- Mantener la identidad visual de SID-Agro.
- Adaptar la interfaz a diferentes tamaños de pantalla.
- Mostrar mensajes claros ante errores, datos faltantes y operaciones exitosas.

### Datos
- Utilizar datos simulados mientras el backend no esté disponible.
- Centralizar los mocks fuera de los componentes visuales.
- Preparar servicios independientes para facilitar la futura integración.
- No utilizar valores ilustrativos como si fueran resultados reales.
- No inventar reglas de cálculo agronómicas o económicas.

## 3. Dashboard económico

**Actor principal:** Gerencia de la empresa arrendataria.

**Referencia:** Caso de uso CU04 — Consultar dashboard económico.

### Funcionalidades obligatorias
- Mostrar ganancias.
- Mostrar ganancia total.
- Mostrar pérdidas estimadas.
- Mostrar costo de aplicación.
- Presentar una comparación visual de escenarios económicos.
- Mostrar un resumen ejecutivo.
- Presentar el detalle de los principales conceptos económicos.
- Mostrar información proveniente del servicio económico correspondiente.

### Comportamientos esperados
- Los indicadores deben actualizarse cuando cambien los datos recibidos.
- Los gráficos deben representar los mismos datos que los indicadores y tablas.
- Si falta información, mostrar un estado de datos insuficientes.
- Si el servicio de precios de soja no está disponible, informar que los datos pueden estar incompletos o desactualizados.

### Consideraciones
- Los filtros por lote y campaña aparecen en los prototipos y deben implementarse si los datos disponibles permiten utilizarlos.
- No inventar fórmulas para calcular rentabilidad, ganancias o pérdidas.
- Los valores económicos iniciales pueden provenir de mocks coherentes.

## 4. Simulador de escenarios

**Actor principal:** Ingeniero agrónomo.

**Referencias:** CU07 — Simular escenarios productivos y CU08 — Obtener recomendación agronómica.

### Formulario de entrada
Permitir ingresar o seleccionar:
- Provincia.
- Lote.
- Viento.
- Precipitación.
- Riesgo de plaga.
- GDD.
- GDDA.

### Funcionalidades obligatorias
- Permitir configurar un escenario productivo.
- Validar los campos antes de ejecutar la simulación.
- Mostrar mensajes cuando existan parámetros incompletos o inválidos.
- Permitir ejecutar la acción Simular escenario.
- Mostrar el nivel de riesgo resultante.
- Mostrar una ventana sugerida.
- Mostrar un resumen de las condiciones seleccionadas.
- Mostrar la información climática disponible.
- Mostrar la recomendación agronómica asociada.
- Informar cuando no sea posible completar la simulación.

### Consideraciones
- El frontend debe enviar los parámetros a un servicio de simulación.
- Inicialmente, el servicio podrá devolver respuestas simuladas.
- No implementar reglas agronómicas definitivas sin validación.
- No generar recomendaciones arbitrarias presentándolas como científicamente válidas.
- La comparación de dos escenarios deberá contemplarse en el diseño funcional, pero su interacción exacta debe confirmarse con el equipo.

## 5. Monitoreo de chinche verde

**Actor principal:** Ingeniero agrónomo.

**Referencia:** CU06 — Monitorear chinche verde.

### Información que debe mostrar
- GDD acumulado.
- GDDA.
- Etapa fenológica.
- Nivel de riesgo.
- Fechas o ventanas óptimas de monitoreo.
- Condiciones climáticas.
- Próximo monitoreo sugerido.
- Alertas relevantes.

### Registro de observaciones
Permitir ingresar:
- Presencia o ausencia de chinche verde.
- Densidad observada.
- Observaciones de campo.
- Fecha del monitoreo.

### Funcionalidades obligatorias
- Mostrar el estado actual del cultivo.
- Presentar las fechas óptimas de monitoreo.
- Permitir registrar una observación.
- Validar los campos antes de guardar.
- Mostrar confirmación cuando una observación se registre correctamente.
- Actualizar la información de seguimiento cuando corresponda.
- Informar errores de carga o guardado.

### Consideraciones
- Si se selecciona ausencia de chinche, el campo de densidad podrá deshabilitarse, según el comportamiento del prototipo.
- Los datos climáticos deberán obtenerse mediante un servicio.
- El frontend no debe calcular fechas óptimas utilizando reglas inventadas.
- Las observaciones podrán almacenarse temporalmente mediante mocks hasta disponer del backend.

## 6. Autenticación y roles

La documentación general define tres perfiles:
- Administrador.
- Gerencia.
- Ingeniero agrónomo.

Para el PMV se propone:
- Preparar una estructura de navegación compatible con roles.
- Utilizar usuarios simulados durante el desarrollo inicial.
- Restringir las vistas según el rol cuando se implemente el mecanismo de autenticación.

La implementación definitiva de autenticación debe coordinarse con el backend.

No desarrollar todavía el ABM completo de usuarios sin confirmación.

## 7. Estados de interfaz

Las pantallas deben contemplar, cuando corresponda:
- Cargando datos.
- Datos disponibles.
- Sin información.
- Error del servicio.
- Validación incorrecta.
- Operación exitosa.

## 8. Criterios de aceptación del frontend

Una pantalla se considerará terminada cuando:
- Presente las funcionalidades obligatorias.
- Permita realizar las interacciones previstas.
- Valide correctamente los formularios.
- Muestre resultados coherentes con los datos recibidos.
- No dependa directamente de valores fijos dentro de los componentes.
- Mantenga una presentación visual consistente.
- Funcione sin errores de ejecución.
- Esté preparada para consumir el backend mediante servicios.

## 9. Decisiones pendientes

Antes de implementar comportamientos definitivos, confirmar:
- Contratos de API con el responsable del backend.
- Fórmulas económicas.
- Reglas agronómicas y umbrales de riesgo.
- Comportamiento exacto de la comparación de escenarios.
- Alcance de la autenticación para el PMV.
- Disponibilidad y actualización de datos climáticos y precios de soja.

Las decisiones pendientes no deben resolverse automáticamente inventando funcionalidades.