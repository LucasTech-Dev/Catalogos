const ambiente = require('./ambiente').validarAmbiente();
module.exports = require('./credencialHomologacao').inicializarFirebase(
  ambiente, require('firebase-admin/app')
);
