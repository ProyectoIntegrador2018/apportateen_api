const promise = require('bluebird');
const options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
var connectionString = `postgres://egxgxrzpcqldtt:298a535ec51c41c0eb1b6a7f820fe9801cc1507dc5d621197c955e759abf9fd4@ec2-54-83-27-165.compute-1.amazonaws.com:5432/d7u6tefdf2r940?ssl=true`;
var db = pgp(connectionString);
var admin = require('firebase-admin');

function getAllUsers(req, res, next) {
    db.any('SELECT * FROM "Usuarios" ORDER BY nombre ASC').then(function(data){
        res.status(200).json(data);
    }).catch(function (err){
        return next(err);
    });
}

function getUser(req, res, next){
    db.multi(`SELECT US.*, CA.nombre as categoria FROM "Usuarios" US LEFT JOIN "Categorias" CA ON ca.id = US.idcategoria WHERE US.id='${req.params.id}'; 
    SELECT * FROM "Admins" WHERE uid='${req.params.id}';`)
  .then(data => {
        data[0][0]['isAdmin'] = data[1].length > 0 ? true : false;        
    res.status(200).json(data[0][0]);
  })
  .catch(function (err) {
    return next(err);
  });
}

function createUser(req, res, next) {
    db.none(`INSERT INTO "Usuarios"(id, nombre, apellido, correo, fecha_nacimiento, idcategoria, sexo, tutor_nombre,
        tutor_correo, tutor_telefono, curp, telefono, escuela, escuela_tipo, escuela_grado, experiencia,
        ha_participado, beca, detalle_exp, referencia) 
    SELECT '${req.body.id}', '${req.body.nombre}', '${req.body.apellido}', '${req.body.correo}', 
    TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'), assign_category('${req.body.fecha_nacimiento}'), '${req.body.sexo}',
    '${req.body.tutor_nombre}', '${req.body.tutor_correo}', '${req.body.tutor_telefono}', '${req.body.curp}',
    '${req.body.telefono}', '${req.body.nombreEscuela}', '${req.body.tipoEscuela}', '${req.body.gradoEscuela}',
    '${req.body.experiencia}', '${req.body.exAlumno}', '${req.body.beca}', '${req.body.expDetalle}', '${req.body.referencia}'`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el usuario.'
        });
    })
    .catch(function(err){
        admin.auth().deleteUser(req.body.id)
        .then(function(){
            res.status(500).send('¡Ups! Algo ha salido mal. Intenta volver a registrarte.');
            return next(err);
        })
        .catch(function(error){
            res.status(500).send('Favor de contactar al administrador del sistema para registrarse.');
            return next(error);
        })
    })
}

function updateUser(req, res, next){
    db.none(`UPDATE "Usuarios" SET idtaller=${req.body.idtaller} WHERE id='${req.params.id}'`).then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado satisfactoriamente tu inscripción.'
        })
    }).catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })

}

function getAllSponsors(req, res, next) {
    db.any('SELECT * FROM "Patrocinadores"').then(function(data){
        res.status(200).json(data);
    }).catch(function (err){
        return next(err);
    });
}

function createSponsor(req, res, next){
    console.log(req.body);
    db.none(`INSERT INTO "Patrocinadores"(nombre, correo) 
    VALUES ('${req.body.nombre}', '${req.body.correo}')`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: '¡Muchas gracias! Lo contactaremos lo más pronto posible.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function getGuardianByChildId(req, res, next){
    db.one(`SELECT *
    FROM "Tutores"
    WHERE asignacion='${req.params.id}'`)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(function (err) {
  return next(err);
  });
}

function createGuardian(req, res, next){
    console.log(req.body);
    db.none(`INSERT INTO "Tutores"(nombre, correo, telefono, asignacion) 
    VALUES ('${req.body.nombre}', '${req.body.correo}', '${req.body.telefono}', '${req.body.asignacion}')`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el tutor.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}


function getSedes(req, res, next) {
    db.multi('SELECT * FROM "Sedes" ORDER BY nombre ASC; SELECT * FROM "Talleres";')
    .then(data => {
        data[0].forEach(element => {
            var talleres = [];
            data[1].forEach(el => {
                if (element.id === el.sede)
                    talleres.push(el);
            });
            element['talleres'] = talleres;
            talleres = [];
        });
        res.status(200).json(data[0]);
    })
    .catch(function (err){
        return next(err);
    })
}

function createSede(req, res, next) {
    db.none(`INSERT INTO "Sedes"(nombre, direccion) VALUES ('${req.body.nombre}', '${req.body.direccion}')`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado la sede.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    });
}

function updateSede(req, res, next) {
    db.none(`UPDATE "Sedes" SET nombre='${req.body.nombre}', direccion='${req.body.direccion}' WHERE id=${req.params.id}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado la sede.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}


function removeSede(req, res, next) {
    var sedeId = parseInt(req.params.id);
    db.result(`DELETE FROM "Sedes" WHERE id=${sedeId}`)
    .then(function(){
        res.status(200)
        .json({
          status: 'success',
          message: 'Se eliminó la sede.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function getTalleres(req, res, next) {
    db.multi('SELECT * FROM "Talleres"; SELECT * FROM "Sedes"; Select * From "Categorias"')
    .then(data => {
        data[0].map(function(x){
            data[1].forEach(e => {
                if (x.sede === e.id){
                    x['sedeDesc'] = e.nombre;
                }
            });
            return x;
        })
        res.status(200).json(data);
    })
    .catch(function (err){
        return next(err);
    })
}

function getCorreosByTallerId(req, res, next) {
    let query = 'SELECT correo FROM "Usuarios" where id NOT IN (SELECT uid FROM "Admins")';
    let taller = parseInt(req.params.id);
    if (taller > 0){
       query = `SELECT correo FROM "Usuarios"  where idtaller=${taller}`;
    }
    db.any(query).then(function(data){
        res.status(200).json(data.map(x => x.correo));
    }).catch(function (err){
        res.status(500).send('Ha sucedido un error obteniendo la lista de correos correspondientes. Vuelva a intentar.');
        return next(err);
    });
}

function createTaller(req, res, next) {
    db.none(`INSERT INTO "Talleres"(nombre, descripcion, sede, categoria) 
    VALUES ('${req.body.nombre}', '${req.body.descripcion}', ${req.body.sede}, ${req.body.categoria})`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el taller.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    });
}

function updateTaller(req, res, next) {
    db.none(`UPDATE "Talleres" SET nombre='${req.body.nombre}', descripcion='${req.body.descripcion}', 
    sede=${req.body.sede}, categoria=${req.body.categoria} WHERE id=${req.params.id}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado el taller.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function removeTaller(req, res, next) {
    var sedeId = parseInt(req.params.id);
    db.result(`DELETE FROM "Talleres" WHERE id=${sedeId}`)
    .then(function(){
        res.status(200)
        .json({
          status: 'success',
          message: 'Se eliminó el taller.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}


function getAvisos(req, res, next) {
    db.multi('SELECT * FROM "Avisos"; SELECT * FROM "Talleres"')
    .then(data => {
        var result = data[0].map(function(x){
            if (x.taller == 0){
                x['taller'] = "Aviso público general"
                x['idtaller'] = 0;
            } else {
                data[1].forEach(e => {
                    if (e.id == x.taller){
                        x['idtaller'] = e.id;
                        x['taller'] = e.nombre;
                    }
                });
            }
            return x;
        })
        res.status(200).json(result);
    })
    .catch(function (err){
        return next(err);
    })
}

function getAvisosForUser(req, res, next) {
    db.multi(`SELECT * FROM "Avisos" WHERE taller=${req.params.id} OR taller = 0; SELECT * FROM "Talleres"`)
    .then(data => {
        var result = data[0].map(function(x){
            if (x.taller == 0){
                x['taller'] = "Aviso público general"
                x['idtaller'] = 0;
            } else {
                data[1].forEach(e => {
                    if (e.id == x.taller){
                        x['idtaller'] = e.id;
                        x['taller'] = e.nombre;
                    }
                });
            }
            return x;
        })
        res.status(200).json(result);
    })
    .catch(function (err){
        console.log('HELLO')
        return next(err);
    })
}

function createAviso(req, res, next) {
    db.none(`INSERT INTO "Avisos"(titulo, mensaje, taller) 
    VALUES ('${req.body.titulo}', '${req.body.mensaje}',  ${req.body.idtaller})`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el aviso.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function updateAviso(req, res, next) {
    db.none(`UPDATE "Avisos" SET titulo='${req.body.titulo}', mensaje='${req.body.mensaje}', taller=${req.body.idtaller} WHERE id=${req.params.id}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado el aviso.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function removeAviso(req, res, next) {
    var avisoId = parseInt(req.params.id);
    db.result(`DELETE FROM "Avisos" WHERE id=${avisoId}`)
    .then(function(){
        res.status(200)
        .json({
          status: 'success',
          message: 'Se eliminó el aviso.'
        });
    })
    .catch(function(err){
        return next(err);
    })
}


function getCategorias(req, res, next) {
    db.multi('SELECT * FROM "Categorias"; SELECT * FROM "Talleres"')
    .then(data => {
        var result = data[0].map(function(x){
            var talleres = [];
            data[1].forEach(e => {
                if (x.id === e.categoria){
                    talleres.push(e.nombre);
                }
            });
            x['talleres'] = talleres;
            return x;
        })
        res.status(200).json(result);
    })
    .catch(function (err){
        return next(err);
    })
}

function createCategoria(req, res, next) {
    db.none(`INSERT INTO "Categorias"(nombre, minima, maxima) 
    VALUES ('${req.body.nombre}', ${req.body.minima},  ${req.body.maxima})`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado la categoría.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function updateCategoria(req, res, next) {
    db.none(`UPDATE "Categorias" SET nombre='${req.body.nombre}', minima=${req.body.minima}, maxima=${req.body.maxima} WHERE id=${req.params.id}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado la categoría.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Intente no utilizar caracteres especiales y vuelva a intentar.');
        return next(err);
    })
}

function removeCategoria(req, res, next) {
    var catId = parseInt(req.params.id);
    db.result(`DELETE FROM "Categorias" WHERE id=${catId}`)
    .then(function(){
        res.status(200)
        .json({
          status: 'success',
          message: 'Se eliminó la categoría.'
        });
    })
    .catch(function(err){
        return next(err);
    })
}

function getEstatusConvocatorias(req, res, next) {
    db.one('SELECT estatus FROM "Convocatorias"').then(function(data){
        res.status(200).json(data);
    }).catch(function (err){
        return next(err);
    });
}

function updateEstatusConvocatorias(req, res, next) {
    db.none(`UPDATE "Convocatorias" set estatus=${req.body.estatus}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha modificado el estado de las convocatorias.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}





module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    createUser: createUser,
    updateUser: updateUser,
    getAllSponsors: getAllSponsors,
    createSponsor: createSponsor,
    getGuardianByChildId: getGuardianByChildId,
    createGuardian: createGuardian,
    getSedes: getSedes,
    createSede: createSede,
    updateSede: updateSede,
    removeSede: removeSede,
    getCorreosByTallerId:getCorreosByTallerId,
    getTalleres: getTalleres,
    createTaller: createTaller,
    updateTaller: updateTaller,
    removeTaller: removeTaller,
    getAvisos: getAvisos,
    getAvisosForUser: getAvisosForUser,
    createAviso: createAviso,
    updateAviso: updateAviso,
    removeAviso: removeAviso,
    getCategorias: getCategorias,
    createCategoria: createCategoria,
    updateCategoria: updateCategoria,
    removeCategoria: removeCategoria,
    getEstatusConvocatorias: getEstatusConvocatorias,
    updateEstatusConvocatorias: updateEstatusConvocatorias
}

