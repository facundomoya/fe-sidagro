# SID-Agro — Instrucciones para Claude Code

## Contexto
SID-Agro es un sistema web de apoyo a la toma de decisiones para el cultivo de soja, desarrollado como Trabajo Final Integrador de Ingeniería en Sistemas de Información de la UTN FRT.

El Producto Mínimo Viable (PMV) comprende tres módulos:
1. Dashboard económico.
2. Simulador de escenarios.
3. Monitoreo de chinche verde.

## Tecnologías
- Frontend: React + TypeScript + Vite.
- El backend es desarrollado por otro integrante del equipo.
- No modificar ni implementar el backend.
- No incorporar dependencias innecesarias.

## Reglas de desarrollo
- Priorizar las funcionalidades y requisitos documentados del PMV.
- Utilizar los prototipos de `docs/prototipos/` como referencia visual.
- Se permiten mejoras visuales sutiles, manteniendo la identidad de SID-Agro.
- Crear componentes reutilizables y evitar duplicación de código.
- Mantener una estructura clara y sencilla, apropiada para un proyecto universitario.
- Separar componentes visuales, lógica de presentación, servicios y datos simulados.
- Utilizar TypeScript con tipos explícitos para los datos del sistema.
- Preparar una capa de servicios que permita reemplazar los mocks por llamadas reales al backend.
- No inventar endpoints, fórmulas económicas, reglas agronómicas ni umbrales de riesgo.
- Cuando falte una definición funcional, consultar antes de implementar comportamientos definitivos.
- Identificar claramente los datos simulados y no presentarlos como información real.
- Implementar estados de carga, error y ausencia de datos cuando corresponda.

## Forma de trabajo
- Implementar una funcionalidad o pantalla por vez.
- Antes de modificar varios archivos, explicar brevemente qué se va a realizar.
- Evitar refactorizaciones generales no solicitadas.
- No modificar funcionalidades existentes sin necesidad.
- Al finalizar cada tarea, resumir los archivos modificados y cómo probar los cambios.
- Priorizar soluciones simples y mantenibles.
- Evitar explicaciones extensas y documentación redundante.

## Documentación
Consultar los archivos relevantes de `docs/` según la tarea.

Los prototipos visuales se encuentran en `docs/prototipos/`.

La documentación funcional tendrá prioridad sobre los detalles visuales de los prototipos.