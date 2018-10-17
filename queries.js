const promise = require('bluebird');
const options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
var connectionString = `postgres://egxgxrzpcqldtt:298a535ec51c41c0eb1b6a7f820fe9801cc1507dc5d621197c955e759abf9fd4@ec2-54-83-27-165.compute-1.amazonaws.com:5432/d7u6tefdf2r940?ssl=true`;
var db = pgp(connectionString);

function getAllUsers(req, res, next) {
    db.any('SELECT * FROM "Usuarios" ORDER BY nombre ASC').then(function(data){
        res.status(200).json(data);
    }).catch(function (err){
        return next(err);
    });
}

function getUser(req, res, next){
    db.one(`SELECT *
    FROM "Usuarios"
    WHERE user_id='${req.params.id}'`)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(function (err) {
  return next(err);
  });
}

function createUser(req, res, next) {
    db.none(`INSERT INTO "Usuarios"(id, nombre, apellido, correo, fecha_nacimiento) 
    VALUES ('${req.body.id}', '${req.body.nombre}',  '${req.body.apellido}', '${req.body.correo}', 
    TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'))`)
    .then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el usuario.'
        });
    })
    .catch(function(err){
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
            message: 'Se ha creado el patrocinador.'
        });
    })
    .catch(function(err){
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
        console.log(err.message);
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
        return next(err);
    })
}

function getTalleres(req, res, next) {
    db.multi('SELECT * FROM "Talleres"; SELECT * FROM "Sedes"')
    .then(data => {
        var result = data[0].map(function(x){
            data[1].forEach(e => {
                if (x.sede === e.id){
                    x['sede'] = e.nombre;
                }
            });
            return x;
        })
        res.status(200).json(result);
    })
    .catch(function (err){
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
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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
        res.status(500)
        .json({
            status: 'error',
            message: 'Ha sucedido un error.'
        })
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






module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    createUser: createUser,
    getAllSponsors: getAllSponsors,
    createSponsor: createSponsor,
    getGuardianByChildId: getGuardianByChildId,
    createGuardian: createGuardian,
    getSedes: getSedes,
    createSede: createSede,
    updateSede: updateSede,
    removeSede: removeSede,
    getTalleres: getTalleres,
    getAvisos: getAvisos,
    createAviso: createAviso,
    updateAviso: updateAviso,
    removeAviso: removeAviso
}

