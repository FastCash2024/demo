// src/infrastructure/database/models/Customer.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schemas para subdocumentos
const DispositivoSchema = new Schema({
  dispositivoId: { type: String, trim: true, maxlength: 128 },
  marca: { type: String, trim: true, maxlength: 80 },
  modelo: { type: String, trim: true, maxlength: 80 },
  esEmulador: { type: Boolean, default: false },
  idApp: { type: String, trim: true, maxlength: 120 },
  versionApp: { type: String, trim: true, maxlength: 40 },
  tokenPush: { type: String },
  fechaPrimeraSesion: { type: Date },
  fechaUltimaSesion: { type: Date },
}, { _id: false });

const CuentaBancariaSchema = new Schema({
  titular: { type: Boolean, default: false },
  nombreBanco: { type: String },
  claveBanco: { type: String },
  tipoCuenta: { type: String },
  numeroDeCuenta: { type: String },
  estadoDeCuenta: {
    type: String,
    enum: ['Activo', 'Bloqueado'],
    default: 'Activo'
  },
}, { _id: false });

const DatosDePerfilSchema = new Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  numeroDeTelefonoMovil: { type: String, index: true },
  email: { type: String, lowercase: true, index: true },
  fechaNacimiento: { type: Date },
  curp: { type: String, unique: true, sparse: true, uppercase: true },
  // rfc: { type: String,  sparse: true, uppercase: true },
  estadoCivil: { type: String },
  nivelEducativo: { type: String },
  trabajo: { type: String },
  ingreso: { type: String },
  provinciaCiudad: { type: String },
  sexo: { type: String, enum: ['Masculino', 'Femenino', 'Otro'] },
  
  // URLs para documentos de verificación
  urlCurpFrontal: { type: String },
  urlCurpReverso: { type: String },
  urlSelfie: { type: String },
  
  // Contactos de emergencia
  nombreContactoAmigo: { type: String },
  numeroDeTelefonoMovilAmigo: { type: String },
  nombreContactoFamiliar: { type: String },
  numeroDeTelefonoMovilFamiliar: { type: String },
  
  // Info de préstamos
  nivelDePrestamo: { type: String },
  prestamoEnLinea: { type: String, enum: ['Si', 'No'] },
  cantidadPrestamos: { type: Number, default: 0 },
  prestamosPendientes: { type: Number, default: 0 },
}, { _id: false });

const CustomerSchema = new Schema({
  // Email único como identificador
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  
  // Perfil completo del cliente (sin password - eso va en User)
  datosDePerfil: { type: DatosDePerfilSchema, required: true },
  
  // Información bancaria
  cuentasBancarias: { type: [CuentaBancariaSchema], default: [] },
  
  // Dispositivos registrados
  dispositivos: { type: [DispositivoSchema], default: [] },
  
  // OTP para autenticación
  otp: { type: String },
  otpExpiresAt: { type: Date },
  
  // Metadata
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Suspendido', 'Bloqueado'],
    default: 'Activo'
  },
  fechaUltimaActividad: { type: Date, default: Date.now },
  verificado: { type: Boolean, default: false }
}, { timestamps: true, collection: 'customers' });

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
