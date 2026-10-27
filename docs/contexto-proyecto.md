# SID-Agro — Contexto del proyecto

## 1. Descripción general

SID-Agro es un sistema web inteligente de apoyo a la toma de decisiones para el cultivo de soja, desarrollado como Proyecto Final de Ingeniería en Sistemas de Información de la Universidad Tecnológica Nacional, Facultad Regional Tucumán.

El sistema está orientado a empresas arrendatarias agrícolas, inicialmente en las provincias de San Luis y Santiago del Estero.

Su propósito es integrar información climática, fenológica, sanitaria y económica para facilitar el análisis de situaciones productivas y apoyar las decisiones de los usuarios.

## 2. Problema que busca resolver

Las decisiones relacionadas con el cultivo de soja pueden depender de información dispersa, consultas manuales y experiencia previa.

La falta de integración entre datos climáticos, evolución fenológica, riesgos sanitarios y consecuencias económicas dificulta la evaluación conjunta de alternativas.

SID-Agro busca centralizar esta información y presentarla mediante interfaces comprensibles.

## 3. Alcance del Producto Mínimo Viable (PMV)

El desarrollo actual se concentra en tres módulos principales.

### 3.1. Dashboard económico

Permite visualizar información económica del cultivo para apoyar la toma de decisiones gerenciales.

Incluye:
- Ganancias.
- Ganancia total.
- Pérdidas estimadas.
- Costo de aplicación.
- Comparación de escenarios económicos.
- Resumen ejecutivo.
- Detalle de conceptos económicos.

Se prevé utilizar información interna del sistema y datos provenientes de una API del precio de la soja.

### 3.2. Simulador de escenarios

Permite configurar y analizar escenarios productivos mediante variables como:
- Provincia y lote.
- Viento.
- Precipitación.
- Riesgo de plaga.
- GDD.
- GDDA.

El sistema debe presentar resultados del escenario, nivel de riesgo, ventana sugerida y una recomendación agronómica.

Las reglas de cálculo deben provenir de especificaciones confirmadas o del backend. No deben inventarse.

### 3.3. Monitoreo de chinche verde

Permite apoyar el seguimiento del cultivo frente al riesgo asociado a la chinche verde.

Incluye:
- GDD acumulado y GDDA.
- Etapa fenológica.
- Nivel de riesgo.
- Fechas o ventanas óptimas de monitoreo.
- Información climática.
- Alertas y próximo monitoreo sugerido.
- Registro de observaciones de campo.

Las observaciones contemplan presencia o ausencia de chinche, densidad observada, fecha y comentarios.

## 4. Usuarios del sistema

Los perfiles definidos para SID-Agro son:

- Administrador: gestión de usuarios, roles, permisos y auditoría.
- Gerencia de la empresa arrendataria: consulta de información económica y reportes.
- Ingeniero agrónomo: simulación de escenarios y monitoreo de chinche verde.

Para el PMV, la implementación concreta de autenticación y permisos debe confirmarse con el equipo. Hasta entonces, podrán utilizarse usuarios simulados para probar las interfaces.

## 5. Alcance del frontend

El frontend se desarrolla utilizando React, TypeScript y Vite.

Sus responsabilidades principales son:
- Presentar las pantallas y permitir navegar entre módulos.
- Capturar y validar entradas del usuario.
- Mostrar indicadores, gráficos, resultados y mensajes.
- Consumir los servicios del backend mediante una capa de integración.
- Gestionar estados de carga, error y ausencia de datos.

El frontend no debe asumir la responsabilidad definitiva de los cálculos agronómicos o económicos del sistema.

## 6. Integraciones previstas

El sistema contempla:
- Un backend desarrollado por otro integrante del equipo.
- Una API externa de información climática.
- Una API externa del precio de la soja.
- Persistencia de información mediante una base de datos SQL.

Los endpoints, estructuras de respuesta y mecanismos de autenticación deben coordinarse con el responsable del backend.

## 7. Módulos adicionales del sistema completo

La documentación general también contempla:
- Gestión de usuarios y roles.
- Generación de reportes PDF.
- Auditoría.

Estos módulos no forman parte de los tres módulos principales priorizados para el PMV. Su implementación en esta etapa requiere confirmación.

## 8. Referencias visuales

Los prototipos están disponibles en `docs/prototipos/`.

Se deben utilizar como referencia de estructura, identidad visual y funcionalidades.

Se permiten mejoras visuales sutiles, pero no eliminar funcionalidades requeridas.

Los valores mostrados en los prototipos son ilustrativos y no constituyen resultados validados del sistema.

## 9. Criterios de implementación

- Priorizar los tres módulos del PMV.
- Mantener una interfaz coherente entre pantallas.
- Implementar componentes reutilizables.
- Utilizar mocks para desarrollar y probar las interfaces mientras el backend no esté disponible.
- Separar los datos simulados de la lógica de presentación.
- No inventar fórmulas, reglas agronómicas, endpoints ni requisitos.
- Registrar las decisiones pendientes antes de implementar comportamientos definitivos.