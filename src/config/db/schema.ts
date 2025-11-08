import { pgTable, integer, text, timestamp, numeric, bigint, boolean, date, jsonb, inet, varchar, char } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 🧱 alerta
export const alerta = pgTable('alerta', {
  id: integer('id').primaryKey().default(sql`nextval('alerta_id_seq'::regclass)`),
  id_colmena: integer('id_colmena').notNull(),
  id_tipo_alerta: integer('id_tipo_alerta').notNull(),
  descripcion: text('descripcion'),
  temperatura_c: numeric('temperatura_c'),
  humedad_h: numeric('humedad_h'),
  peso_kg: numeric('peso_kg'),
  presion_hpa: numeric('presion_hpa'),
  sonido_hz: numeric('sonido_hz'),
  fecha_evento: timestamp('fecha_evento').defaultNow(),
  estado: varchar('estado').default('pendiente'),
  id_usuario_atencion: integer('id_usuario_atencion'),
  fecha_creacion: timestamp('fecha_creacion'),
  nota_resolucion: text('nota_resolucion'),
  prioridad: varchar('prioridad').default('media'),
  origen_alerta: varchar('origen_alerta').default('sistema'),
  atendida_por: integer('atendida_por'),
  comentario_atencion: text('comentario_atencion'),
});

// 🧱 apiario
export const apiario = pgTable('apiario', {
  id: integer('id').primaryKey().default(sql`nextval('apiario_id_seq'::regclass)`),
  nombre: text('nombre').notNull(),
  id_empresa: integer('id_empresa').notNull(),
  limite_colmenas: integer('limite_colmenas').default(100),
});

// 🧱 colmena
export const colmena = pgTable('colmena', {
  id: integer('id').primaryKey().default(sql`nextval('colmena_id_seq'::regclass)`),
  nombre_colmena: text('nombre_colmena').notNull(),
  id_apicultor: integer('id_apicultor'),
  id_apiario_actual: integer('id_apiario_actual'),
  id_dispositivo: integer('id_dispositivo'),
  fecha_instalacion: date('fecha_instalacion'),
});

// 🧱 colmena_a_apiario
export const colmena_a_apiario = pgTable('colmena_a_apiario', {
  id: integer('id').primaryKey().default(sql`nextval('colmena_a_apiario_id_seq'::regclass)`),
  id_colmena: integer('id_colmena').notNull(),
  id_apiario_destino: integer('id_apiario_destino').notNull(),
  fecha_cambio: date('fecha_cambio').notNull(),
  observaciones: text('observaciones'),
  id_apiario_origen: integer('id_apiario_origen'),
  motivo_cambio: text('motivo_cambio'),
  responsable_cambio: integer('responsable_cambio'),
});

// 🧱 dispositivo_arrendamiento
export const dispositivo_arrendamiento = pgTable('dispositivo_arrendamiento', {
  id: integer('id').primaryKey().default(sql`nextval('dispositivo_arrendamiento_id_seq'::regclass)`),
  id_dispositivo: integer('id_dispositivo').notNull(),
  id_empresa: integer('id_empresa').notNull(),
  fecha_asignacion: date('fecha_asignacion').default(sql`CURRENT_DATE`).notNull(),
  fecha_devolucion: date('fecha_devolucion'),
  costo_mensual: numeric('costo_mensual').notNull(),
  estado: varchar('estado').default('asignado'),
  notas: text('notas'),
});

// 🧱 dispositivo_simonia
export const dispositivo_simonia = pgTable('dispositivo_simonia', {
  id: integer('id').primaryKey().default(sql`nextval('dispositivo_simonia_id_seq'::regclass)`),
  codigo_unico: varchar('codigo_unico').notNull(),
  modelo: varchar('modelo'),
  firmware_version: varchar('firmware_version'),
  fecha_registro: timestamp('fecha_registro').defaultNow(),
  estado: varchar('estado').default('activo'),
});

// 🧱 lectura_sensor
export const lectura_sensor = pgTable('lectura_sensor', {
  id: integer('id').primaryKey().default(sql`nextval('lectura_sensor_id_seq'::regclass)`),
  id_colmena: integer('id_colmena').notNull(),
  temperatura_c: numeric('temperatura_c'),
  humedad_h: numeric('humedad_h'),
  peso_kg: numeric('peso_kg'),
  sonido_hz: numeric('sonido_hz'),
  fecha_registro: timestamp('fecha_registro').defaultNow(),
  presion_hpa: numeric('presion_hpa'),
});

// 🧱 historial_lectura_sensor
export const historial_lectura_sensor = pgTable('historial_lectura_sensor', {
  id: integer('id').primaryKey().default(sql`nextval('historial_lectura_sensor_id_seq'::regclass)`),
  id_lectura: integer('id_lectura').notNull(),
  id_colmena: integer('id_colmena').notNull(),
  temperatura_c: numeric('temperatura_c'),
  humedad_h: numeric('humedad_h'),
  peso_kg: numeric('peso_kg'),
  sonido_hz: numeric('sonido_hz'),
  fecha_lectura_original: timestamp('fecha_lectura_original'),
  fecha_respaldo: timestamp('fecha_respaldo').defaultNow(),
  origen: varchar('origen'),
  presion_hpa: numeric('presion_hpa'),
});

// 🧱 estado_colmena
export const estado_colmena = pgTable('estado_colmena', {
  id: integer('id').primaryKey().default(sql`nextval('estado_colmena_id_seq'::regclass)`),
  id_colmena: integer('id_colmena').notNull(),
  estado: varchar('estado').notNull(),
  fecha_registro: date('fecha_registro').default(sql`CURRENT_DATE`),
  hora_registro: text('hora_registro').default(sql`CURRENT_TIME`),
  id_usuario: integer('id_usuario'),
  comentario: text('comentario'),
});

// 🧱 tipo_alerta
export const tipo_alerta = pgTable('tipo_alerta', {
  id: integer('id').primaryKey().default(sql`nextval('tipo_alerta_id_seq'::regclass)`),
  nombre: varchar('nombre').notNull(),
  codigo: char('codigo').notNull(),
  color_hex: char('color_hex'),
  descripcion: text('descripcion'),
});

// 🧱 ubicacion_apiario
export const ubicacion_apiario = pgTable('ubicacion_apiario', {
  id: integer('id').primaryKey().default(sql`nextval('ubicacion_apiario_id_seq'::regclass)`),
  id_apiario: integer('id_apiario').notNull(),
  locacion: text('locacion').notNull(),
  fecha_registro: timestamp('fecha_registro').defaultNow(),
});


// 🧱 empresa
export const empresa = pgTable('empresa', {
  id: integer('id').primaryKey().default(sql`nextval('empresa_id_seq'::regclass)`),
  nombre: text('nombre').notNull(),
  fecha_registro: timestamp('fecha_registro').defaultNow(),
  pais: varchar('pais'),
  direccion: text('direccion'),
  numero_telefono: integer('numero_telefono'),
  correo_contacto: text('correo_contacto'),
  estado_empresa: varchar('estado_empresa').default('activa'),
});

// 🧱 usuario
export const usuario = pgTable('usuario', {
  id: integer('id').primaryKey().default(sql`nextval('usuario_id_seq'::regclass)`),
  nombre: text('nombre').notNull(),
  correo: text('correo').notNull(),
  tipo_usuario: varchar('tipo_usuario').notNull(),
  id_empresa: integer('id_empresa'),
  fecha_nacimiento: date('fecha_nacimiento'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  region: text('region'),
  pais: text('pais').default('Chile'),
  rut: varchar('rut'),
  telefono: varchar('telefono'),
});

// 🧱 rol
export const rol = pgTable('rol', {
  id: integer('id').primaryKey().default(sql`nextval('rol_id_seq'::regclass)`),
  nombre: varchar('nombre').notNull(),
  descripcion: text('descripcion'),
});

// 🧱 usuario_rol
export const usuario_rol = pgTable('usuario_rol', {
  id: integer('id').primaryKey().default(sql`nextval('usuario_rol_id_seq'::regclass)`),
  id_usuario: integer('id_usuario').notNull(),
  id_rol: integer('id_rol').notNull(),
  fecha_asignacion: timestamp('fecha_asignacion').defaultNow(),
});

// 🧱 suscripcion_empresa
export const suscripcion_empresa = pgTable('suscripcion_empresa', {
  id: integer('id').primaryKey().default(sql`nextval('suscripcion_empresa_id_seq'::regclass)`),
  id_empresa: integer('id_empresa').notNull(),
  fecha_inicio: date('fecha_inicio').default(sql`CURRENT_DATE`).notNull(),
  fecha_fin: date('fecha_fin').notNull(),
  estado: varchar('estado').default('activa'),
  renovacion_automatica: boolean('renovacion_automatica').default(true),
  max_colmenas: integer('max_colmenas'),
  max_apiarios: integer('max_apiarios'),
  max_usuarios: integer('max_usuarios'),
  precio_mensual: numeric('precio_mensual').notNull(),
  notas: text('notas'),
  fecha_creacion: timestamp('fecha_creacion').defaultNow(),
});

// 🧱 factura
export const factura = pgTable('factura', {
  id: integer('id').primaryKey().default(sql`nextval('factura_id_seq'::regclass)`),
  id_pago: integer('id_pago'),
  id_empresa: integer('id_empresa').notNull(),
  numero_factura: varchar('numero_factura').notNull(),
  monto_total: numeric('monto_total').notNull(),
  concepto: text('concepto'),
  fecha_emision: timestamp('fecha_emision').defaultNow(),
  fecha_vencimiento: date('fecha_vencimiento'),
  estado_factura: varchar('estado_factura').default('pendiente'),
  url_pdf: text('url_pdf'),
});

// 🧱 pago
export const pago = pgTable('pago', {
  id: integer('id').primaryKey().default(sql`nextval('pago_id_seq'::regclass)`),
  id_empresa: integer('id_empresa').notNull(),
  id_suscripcion: integer('id_suscripcion'),
  monto: numeric('monto').notNull(),
  moneda: varchar('moneda').default('USD'),
  fecha_pago: timestamp('fecha_pago').defaultNow(),
  metodo_pago: varchar('metodo_pago'),
  estado_pago: varchar('estado_pago').default('pendiente'),
  referencia_transaccion: varchar('referencia_transaccion'),
  concepto: text('concepto'),
});

// 🧱 recordatorio_pago
export const recordatorio_pago = pgTable('recordatorio_pago', {
  id: integer('id').primaryKey().default(sql`nextval('recordatorio_pago_id_seq'::regclass)`),
  id_factura: integer('id_factura').notNull(),
  fecha_envio: timestamp('fecha_envio').defaultNow(),
  tipo_notificacion: varchar('tipo_notificacion'),
  entregado: boolean('entregado').default(false),
});

// 🧱 uso_empresa
export const uso_empresa = pgTable('uso_empresa', {
  id: integer('id').primaryKey().default(sql`nextval('uso_empresa_id_seq'::regclass)`),
  id_empresa: integer('id_empresa').notNull(),
  total_apiarios: integer('total_apiarios').default(0),
  total_colmenas: integer('total_colmenas').default(0),
  ultima_actualizacion: timestamp('ultima_actualizacion').defaultNow(),
});

// 🧱 configuracion_reporte
export const configuracion_reporte = pgTable('configuracion_reporte', {
  id: integer('id').primaryKey().default(sql`nextval('configuracion_reporte_id_seq'::regclass)`),
  id_empresa: integer('id_empresa').notNull(),
  tipo_reporte: varchar('tipo_reporte').notNull(),
  descripcion: text('descripcion'),
  incluir_estado_colmenas: boolean('incluir_estado_colmenas').default(true),
  incluir_produccion: boolean('incluir_produccion').default(true),
  incluir_alertas: boolean('incluir_alertas').default(true),
  incluir_tendencias: boolean('incluir_tendencias').default(false),
  incluir_comparativas: boolean('incluir_comparativas').default(false),
  activo: boolean('activo').default(true),
  fecha_creacion: timestamp('fecha_creacion').defaultNow(),
});

// 🧱 registro_accion
export const registro_accion = pgTable('registro_accion', {
  id: integer('id').primaryKey().default(sql`nextval('registro_accion_id_seq'::regclass)`),
  id_usuario: integer('id_usuario'),
  id_empresa: integer('id_empresa'),
  tipo_accion: varchar('tipo_accion'),
  descripcion: text('descripcion'),
  tabla_afectada: varchar('tabla_afectada'),
  id_registro_afectado: integer('id_registro_afectado'),
  datos_anteriores: jsonb('datos_anteriores'),
  datos_nuevos: jsonb('datos_nuevos'),
  ip_origen: inet('ip_origen'),
  fecha_accion: timestamp('fecha_accion').defaultNow(),
  exito: boolean('exito').default(true),
});



// 🧱 dashboard_auditoria (vista)
export const dashboard_auditoria = pgTable('dashboard_auditoria', {
  usuario: text('usuario'),
  empresa: text('empresa'),
  tipo_accion: varchar('tipo_accion'),
  descripcion: text('descripcion'),
  tabla_afectada: varchar('tabla_afectada'),
  fecha_accion: timestamp('fecha_accion'),
  exito: boolean('exito'),
});

// 🧱 dashboard_financiero (vista)
export const dashboard_financiero = pgTable('dashboard_financiero', {
  id_empresa: integer('id_empresa'),
  empresa: text('empresa'),
  inicio_suscripcion: date('inicio_suscripcion'),
  vencimiento_suscripcion: date('vencimiento_suscripcion'),
  estado_suscripcion: varchar('estado_suscripcion'),
  precio_mensual: numeric('precio_mensual'),
  facturas_emitidas: varchar('facturas_emitidas'),
  facturas_pagadas: varchar('facturas_pagadas'),
  facturas_vencidas: varchar('facturas_vencidas'),
  total_facturado: numeric('total_facturado'),
  total_pagado: numeric('total_pagado'),
});

// 🧱 vista_usuarios_roles (vista)
export const vista_usuarios_roles = pgTable('vista_usuarios_roles', {
  id_usuario: integer('id_usuario'),
  usuario: text('usuario'),
  empresa: text('empresa'),
  rol: varchar('rol'),
  descripcion: text('descripcion'),
});
