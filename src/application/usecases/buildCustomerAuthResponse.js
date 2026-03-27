const jwt = require('jsonwebtoken');

const buildCustomerAuthResponse = (customerDoc) => {
  const customer = customerDoc.toObject ? customerDoc.toObject() : customerDoc;
  const customerId = String(customer._id || customer.id);

  if (customer.datosDePerfil) {
    delete customer.datosDePerfil.password;
  }

  const secret = process.env.JWT_SECRET || 'clave_secreta_super_segura_de_desarrollo';
  const token = jwt.sign(
    { id: customerId, email: customer.email, tipo: 'customer' },
    secret,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: customerId,
      email: customer.email,
      datosDePerfil: customer.datosDePerfil,
      cuentasBancarias: customer.cuentasBancarias || [],
      dispositivos: customer.dispositivos || [],
      estado: customer.estado,
      verificado: customer.verificado,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
  };
};

module.exports = buildCustomerAuthResponse;
