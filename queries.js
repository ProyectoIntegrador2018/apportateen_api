const promise = require('bluebird');
const options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
var connectionString = `postgres://egxgxrzpcqldtt:298a535ec51c41c0eb1b6a7f820fe9801cc1507dc5d621197c955e759abf9fd4@ec2-54-83-27-165.compute-1.amazonaws.com:5432/d7u6tefdf2r940?ssl=true`;
var db = pgp(connectionString);
var admin = require('firebase-admin');

//DB FUNCTION - CREATE Archivo IN DB
function createArchivoAdmn(req, res, next) {
    db.none(`INSERT INTO "Archivos"(user_id, nombre, fecha_subida, url, archivo_path) VALUES ('${req.body.user_id}', '${req.body.nombre}', TO_DATE('${req.body.fecha_subida}','DD-MM-YYYY'), '${req.body.url}', '${req.body.archivo_path}')`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Archivo Subido'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentarlo.');
        return next(err);
    })
}

//DB FUNCTION - GET ALL ARCHIVOS FROM DATABASE
function getArchivosAdmn(req, res, next) {
    db.multi(`SELECT ar.* FROM "Archivos" ar WHERE ar.user_id IN (SELECT uid FROM "Admins")`).then(function(data){
        res.status(200).json(data);
    }).catch(function(err) {
        return next(err);
    })
}
//DB FUNCTION - GET ARCHIVOS FROM SPECIFIC USER
function getArchivoUser(req, res, next) {
    console.log(req.param.id);
    db.multi(`SELECT * FROM "Archivos" WHERE user_id='${req.params.id}'; SELECT ar.user_id, COUNT(ar.id) as Cantidad FROM "Archivos" ar WHERE user_id='${req.params.id}' GROUP BY ar.user_id`).then(function(data){
        data[0].forEach(x => {
            var hasNoDoc = true;
            data[1].forEach(y => {
                if(x.user_id == y.user_id){
                    x['count'] = y.cantidad;
                    hasNoDoc = false; 
                }
            });
            if(hasNoDoc){
                x['count'] = 0;
            }
        });
        res.status(200).json(data);
    }).catch(function(err) {
        return next(err);
    })
}

function getArchivoAdminByUsers(req, res, next) {
    console.log(req.param.id);
    db.multi(`SELECT * FROM "Archivos" WHERE user_id !='${req.params.id}'`).then(function(data){
        res.status(200).json(data);
    }).catch(function(err) {
        return next(err);
    })
}

//DB FUNCITON - DELETE SPECIFIC DOCUMENT
function deleteArchivoAdmn(req, res, next){
    db.none(`DELETE FROM "Archivos" WHERE archivo_path='${req.params.id}'`)
    .then(function() {
        res.status(200)
        .json({
            status : 'success',
            message: 'Se eliminó el archivo satisfactoriamente.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function getAllUsers(req, res, next) {
    db.multi(`SELECT u.* FROM "Usuarios" u WHERE u.id NOT IN(SELECT uid FROM "Admins") ORDER BY nombre ASC; SELECT ar.user_id, COUNT(ar.id) as Cantidad FROM "Archivos" ar GROUP BY ar.user_id`).then(function(data){
        data[0].map(x=> {
            x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
            return x;
        });
        data[0].forEach(x => {
            var hasNoDoc = true;
            data[1].forEach(y => {
                if(x.id == y.user_id){
                    x['documentos'] = y.cantidad;
                    hasNoDoc = false; 
                }
            });
            if(hasNoDoc){
                x['documentos'] = 0;
            }
        });
        res.status(200).json(data[0]);
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

function getUsersUsuarios(req, res, next) {
    db.any(`SELECT distinct u.* FROM "Usuarios" u WHERE u.id NOT IN(SELECT uid FROM "Admins")`)
    .then(function(data) {
        data.map(x=> {
            x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
            return x;
        })
        res.status(200).json(data);
    }).catch(function (err){
        return next(err)
    })
}

function getUsersAdmn(req, res, next) {
    db.any(`SELECT distinct u.* FROM "Usuarios" u WHERE u.id IN(SELECT uid FROM "Admins")`)
    .then(function(data) {
        data.map(x=> {
            x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
            return x;
        })
        res.status(200).json(data);
    }).catch(function (err){
        return next(err)
    })
}

function addUserAdmin(req, res, next) {
    console.log(req.body.id);
    db.none(`INSERT INTO "Admins"(uid) VALUES ('${req.body.id}')`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Usuario asignado como Administrador correctamente.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function deleteUserAdmin(req, res, next) {
    db.none(`DELETE FROM "Admins" WHERE uid='${req.params.id}'`)
    .then(function() {
        res.status(200)
        .json({
            status : 'success',
            message: 'Se eliminó el Administrador satisfactoriamente.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function getUserByEmail() {
    db.one(`SELECT * FROM "Usuarios WHERE correo='${req.params.correo}'`)
    .then(function (data) {
        res.status(200).json(data);
    })
    .catch(function (err) {
        return next(err);
    });
}

function createUser(req, res, next) {
    console.log(req.body.escuela);
    db.none(`INSERT INTO "Usuarios"(id, nombre, apellido, correo, fecha_nacimiento, idcategoria, sexo, tutor_nombre,
        tutor_correo, tutor_telefono, curp, telefono, escuela, escuela_tipo, escuela_grado, experiencia,
        ha_participado, beca, detalle_exp, referencia, id_axtuser, documentos,razon_beca) 
    SELECT '${req.body.id}', '${req.body.nombre}', '${req.body.apellido}', '${req.body.correo}', 
    TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'), assign_category('${req.body.fecha_nacimiento}'), '${req.body.sexo}',
    '${req.body.tutor_nombre}', '${req.body.tutor_correo}', '${req.body.tutor_telefono}', '${req.body.curp}',
    '${req.body.telefono}', '${req.body.escuela}', '${req.body.escuela_tipo}', '${req.body.escuela_grado}',
    '${req.body.experiencia}', '${req.body.exAlumno}', '${req.body.beca}', '${req.body.detalle_exp}', '${req.body.referencia}', '${req.body.id_axtuser}',0, '${req.body.razon_beca}'`)
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

function updateUserTaller(req, res, next){
    db.none(`UPDATE "Usuarios" SET idtaller=${req.body.idtaller}, id_axtuser='${req.body.id_axtuser}' WHERE id='${req.params.id}'`).then(function(){
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

function updateUserComplete(req, res, next) {
    db.none(`UPDATE "Usuarios" SET nombre='${req.body.nombre}', apellido='${req.body.apellido}', fecha_nacimiento=TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'), correo='${req.body.correo}', telefono='${req.body.telefono}', curp='${req.body.curp}', idtaller=${req.body.idtaller}, escuela='${req.body.escuela}', idcategoria=${req.body.idcategoria}, sexo='${req.body.sexo}', tutor_nombre='${req.body.tutor_nombre}', tutor_correo='${req.body.tutor_correo}', tutor_telefono='${req.body.tutor_telefono}', escuela_tipo='${req.body.escuela_tipo}', escuela_grado='${req.body.escuela_grado}', ha_participado='${req.body.ha_participado}', beca='${req.body.beca}', detalle_exp='${req.body.detalle_exp}', referencia='${req.body.referencia}', razon_beca='${req.body.razon_beca}' WHERE id='${req.params.id}'`)
    .then(function(){
        res.status(200)
        .json({
            status : 'success',
            message : 'Se ha modificado satisfactoriamente el usuario.'
        });
    }).catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function removeUser(req, res, next) {
    console.log(req.params.id);
    admin.auth().deleteUser(req.params.id)
        .then(function(){
            db.none(`DELETE FROM "Usuarios" WHERE id='${req.params.id}'`)
    .then(function() {
        res.status(200)
        .json({
            status : 'success',
            message: 'Se eliminó el usuario satisfactoriamente.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
        })
        .catch(function(error){
            res.status(500).send('Favor de contactar al administrador del sistema para registrarse.');
            return next(error);
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

function removeSponsor(req, res, next) {
    var sedeId = parseInt(req.params.id);
    db.result(`DELETE FROM "Patrocinadores" WHERE id=${sedeId}`)
    .then(function(){
        res.status(200)
        .json({
          status: 'success',
          message: 'Se eliminó el patrocinador.'
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
    db.multi(`SELECT * FROM "Sedes" ORDER BY nombre ASC; SELECT * FROM "Talleres"; 
    SELECT COUNT(*) as inscritos, idtaller FROM "Usuarios" GROUP BY idtaller;`)
    .then(data => {
        data[1].forEach(el => {
            var registro = true;
            data[2].forEach(x => {
                if (x.idtaller == el.id){
                    el['inscritos'] = x.inscritos;
                    registro = false;
                }
            })
            if (registro){
                el['inscritos'] = 0;
            }
        });
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
    db.none(`INSERT INTO "Sedes"(nombre, direccion, gratis) VALUES ('${req.body.nombre}', '${req.body.direccion}', '${req.body.gratis}')`)
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
    db.none(`UPDATE "Sedes" SET nombre='${req.body.nombre}', direccion='${req.body.direccion}', gratis='${req.body.gratis}' WHERE id=${req.params.id}`)
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


function getTaller(req, res, next) {
    let taller = parseInt(req.params.id);
    db.multi(`SELECT T.*, S.nombre as sedeDesc, S.direccion, S.id as idSede, S.gratis FROM "Talleres" T JOIN "Sedes" S ON T.sede = S.id WHERE T.id = ${taller}; SELECT COUNT(*) as inscritos FROM "Usuarios" WHERE idtaller = ${taller};`)
    .then(data => {
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

function getCostos(req, res, next){
    db.one('SELECT escuela_privada, escuela_publica FROM "CostosTalleres"').then(function(data){
        res.status(200).json(data);
    }).catch(function (err){
        return next(err);
    });
}

function updateCostos(req, res, next){
    db.none(`UPDATE "CostosTalleres" SET escuela_publica='${req.body.escuela_publica}', escuela_privada=${req.body.escuela_privada}`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se han modificado los costos.'
        });
    })
    .catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })
}

function createTaller(req, res, next) {
    db.none(`INSERT INTO "Talleres"(nombre, descripcion, sede, categoria, cupo, url, foto_path) 
    VALUES ('${req.body.nombre}', '${req.body.descripcion}', ${req.body.sede}, 9, ${req.body.cupo}, '${req.body.url}', '${req.body.foto_path}')`)
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
    sede=${req.body.sede}, categoria=${req.body.categoria}, cupo= ${req.body.cupo}, url='${req.body.url}', foto_path='${req.body.foto_path}' WHERE id=${req.params.id}`)
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

function updateUserNumConfPago(req, res, next){
    db.none(`UPDATE "Usuarios" SET num_conf_pago='${req.body.num_conf_pago}' WHERE id='${req.params.id}'`).then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha guardado satisfactoriamente tu número de confirmación de pago.'
        })
    }).catch(function(err){
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })

}




module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    getUserByEmail : getUserByEmail,
    createUser: createUser,
    updateUserTaller: updateUserTaller,
    removeUser: removeUser,
    getAllSponsors: getAllSponsors,
    createSponsor: createSponsor,
    removeSponsor:removeSponsor,
    getGuardianByChildId: getGuardianByChildId,
    createGuardian: createGuardian,
    getSedes: getSedes,
    createSede: createSede,
    updateSede: updateSede,
    removeSede: removeSede,
    getCorreosByTallerId:getCorreosByTallerId,
    getTalleres: getTalleres,
    getTaller: getTaller,
    getCostos: getCostos,
    updateCostos: updateCostos,
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
    updateEstatusConvocatorias: updateEstatusConvocatorias,
    updateUserComplete : updateUserComplete,
    getArchivosAdmn : getArchivosAdmn,
    createArchivoAdmn : createArchivoAdmn,
    deleteArchivoAdmn : deleteArchivoAdmn,
    getArchivoUser : getArchivoUser,
    getArchivoAdminByUsers : getArchivoAdminByUsers,
    getUsersUsuarios : getUsersUsuarios,
    getUsersAdmn : getUsersAdmn,
    addUserAdmin : addUserAdmin,
    deleteUserAdmin : deleteUserAdmin,
    updateUserNumConfPago : updateUserNumConfPago
}

