// src/infrastructure/database/models/Prestamo.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactoSchema = new Schema({
  nombre: { type: String },
  numeroDeTelefonoMovil: { type: String },
}, { _id: false });

const SmsSchema = new Schema({
  remitente: { type: String },
  contenido: { type: String },
}, { _id: false });

const CuentaBancariaSnapshotSchema = new Schema({
  versionSchema: { type: Number, default: 1 },
  fechaDeSnapshot: { type: Date, default: Date.now },
  titular: { type: Boolean },
  nombreBanco: { type: String },
  claveBanco: { type: String },
  tipoCuenta: { type: String },
  numeroDeCuenta: { type: String },
  estadoDeCuenta: {
    type: String,
    enum: ["Activo", "Bloqueado"],
    default: "Activo",
  },
}, { _id: false });

const AcotacionSchema = new Schema({
  tipo: {
    type: String,
    enum: ["verificacion", "cobranza", "auditoria"],
    required: true,
  },
  estadoDeCredito: { type: String },
  estadoDeComunicacion: { type: String },
  acotacion: { type: String },
  cuenta: { type: String },
  asesor: { type: String },
  emailAsesor: { type: String },
  fechaDeAcotacion: { type: Date, default: Date.now },
}, { _id: false });

const AcotacionSnapshotSchema = new Schema({
  acotacionId: { type: Schema.Types.ObjectId },
  tipo: {
    type: String,
    enum: ["verificacion", "cobranza", "auditoria"],
    required: true,
  },
  estadoDeCredito: { type: String },
  estadoDeComunicacion: { type: String },
  acotacion: { type: String, trim: true, maxlength: 5000 },
  cuentaOperativa: { type: String },
  cuentaPersonal: { type: String },
  nombreAsesor: { type: String },
  fecha: { type: Date, default: Date.now },
  origen: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { _id: false });

const HistorialAsesorSchema = new Schema({
  nombreAsesor: { type: String },
  cuentaOperativa: { type: String },
  cuentaPersonal: { type: String },
  fechaDeAsignacion: { type: Date, default: Date.now },
}, { _id: false });

function buildPrestamoFields() {
  return {
    numeroDePrestamo: { type: String, unique: true, index: true },
    idDeSubFactura: { type: String },

    solicitud: {
      versionSchema: { type: Number, default: 1 },
      cliente: {
        nombreDelCliente: { type: String },
        numeroDeTelefonoMovil: { type: String, index: true },
        clienteNuevo: { type: String },
        curp: { type: String },
        rfc: { type: String },
        email: { type: String },
        urlCurpFrontal: { type: String },
        urlCurpReverso: { type: String },
        urlSelfie: { type: String },
        contactosExportadosUrl: { type: String },
      },
      dispositivo: {
        dispositivoId: { type: String, trim: true, maxlength: 128 },
        marca: { type: String, trim: true, maxlength: 80 },
        modelo: { type: String, trim: true, maxlength: 80 },
        esEmulador: { type: Boolean, default: false },
        idApp: { type: String, trim: true, maxlength: 120 },
        versionApp: { type: String, trim: true, maxlength: 40 },
      },
      producto: {
        nombreDelProducto: { type: String }, //Cohete Prestamo
        icon: { type: String },
      },
      cuentaBancariaId: { type: String, index: true },
      cuentaBancariaSnapshot: { type: CuentaBancariaSnapshotSchema },
      montos: {
        valorAdeudadoCentavos: { type: Number, min: 0 },
        valorDispersadoCentavos: { type: Number, min: 0 },
        valorPrestamoMenosInteresCentavos: { type: Number, min: 0 },
        valorExtencionCentavos: { type: Number, min: 0 },
        valorOperativoCentavos: { type: Number, min: 0 },
        ivaBps: { type: Number, min: 0, max: 10000, default: 1600 },
        interesPorcentaje: { type: String },
        interesDiarioPorcentaje: { type: String },
        nivelDePrestamo: { type: String },
        interesTotal: { type: String },
      },
      fechaDeCreacionDeLaTarea: { type: Date },
    },

    cicloDeVida: {
      estadoDeCredito: { type: String, index: true },
      valorLiquidacionCentavos: { type: Number, min: 0 },
      fechas: {
        fechaDeDispersion: { type: Date },
        fechaDeCobro: { type: Date },
        fechaDeReembolso: { type: Date },
      },
    },

    operacion: {
      verificacion: {
        asesorVerificador: { type: String },
        emailAsesorVerificador: { type: String },
        cuentaVerificador: { type: String },
        fechaDeTramitacionDelCaso: { type: Date },
        nombreDeLaEmpresa: { type: String },
      },
      cobranza: {
        asesorCobrador: { type: String },
        emailAsesorCobrador: { type: String },
        cuentaCobrador: { type: String },
        fechaDeTramitacionDeCobro: { type: Date },
        nombreDeLaEmpresa: { type: String },
        estadoDeComunicacion: { type: String },
        fechaRegistroComunicacion: { type: Date },
      },
      auditoria: {
        asesorAuditor: { type: String },
        emailAsesorAuditor: { type: String },
        cuentaAuditor: { type: String },
        nombreDeLaEmpresa: { type: String },
      },
      acotaciones: { type: [AcotacionSchema], default: [] },
      ultimaAcotacionVerificacion: { type: AcotacionSnapshotSchema, default: null },
      ultimaAcotacionCobranza: { type: AcotacionSnapshotSchema, default: null },
      ultimaAcotacionAuditoria: { type: AcotacionSnapshotSchema, default: null },
      historialDeAsesores: { type: [HistorialAsesorSchema], default: [] },
    },

    integraciones: {
      stp: {
        claveRastreoDispersionSTP: { type: String },
        ordenDeDispersion: { type: Schema.Types.Mixed },
        claveRastreoAbonoSTP: { type: String },
      },
    },

    pagos: {
      cuentaClabeParaCobro: { type: String },
    },
  };
}

function createPrestamoSchema() {
  return new Schema(buildPrestamoFields(), {
    timestamps: true,
    collection: "prestamos",
  });
}

// Exportamos el modelo compilado de Mongoose
const prestamoSchema = createPrestamoSchema();
const Prestamo = mongoose.model('Prestamo', prestamoSchema);

module.exports = Prestamo;
