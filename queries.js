const promise = require('bluebird');
const options = {
    promiseLib: promise
}
var pgp = require('pg-promise')(options);
var connectionString = `postgres://gccrxdkceuxntk:d8a6676402ee5f0384d937d0bf476fe13a04da609483b4ded861a599c83f3da0@ec2-54-235-192-146.compute-1.amazonaws.com:5432/dcp33lg0olk9lc?ssl=true`;
//var connectionString = `postgres://egxgxrzpcqldtt:298a535ec51c41c0eb1b6a7f820fe9801cc1507dc5d621197c955e759abf9fd4@ec2-54-83-27-165.compute-1.amazonaws.com:5432/d7u6tefdf2r940?ssl=true`;

var db = pgp(connectionString);
var admin = require('firebase-admin');

//DB FUNCTION - CREATE Archivo IN DB
function createArchivoAdmn(req, res, next) {
    db.none(`INSERT INTO "Archivos"(user_id, nombre, fecha_subida, url, archivo_path) VALUES ('${req.body.user_id}', '${req.body.nombre}', TO_DATE('${req.body.fecha_subida}','DD-MM-YYYY'), '${req.body.url}', '${req.body.archivo_path}')`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Archivo Subido'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentarlo.');
            return next(err);
        })
}

//DB FUNCTION - GET ALL ARCHIVOS FROM DATABASE
function getArchivosAdmn(req, res, next) {
    db.multi(`SELECT ar.* FROM "Archivos" ar WHERE ar.user_id IN (SELECT uid FROM "Admins")`).then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    })
}
//DB FUNCTION - GET ARCHIVOS FROM SPECIFIC USER
function getArchivoUser(req, res, next) {
    db.multi(`SELECT * FROM "Archivos" WHERE user_id='${req.params.id}'; SELECT ar.user_id, COUNT(ar.id) as Cantidad FROM "Archivos" ar WHERE user_id='${req.params.id}' GROUP BY ar.user_id`).then(function (data) {
        data[0].forEach(x => {
            var hasNoDoc = true;
            data[1].forEach(y => {
                if (x.user_id == y.user_id) {
                    x['count'] = y.cantidad;
                    hasNoDoc = false;
                }
            });
            if (hasNoDoc) {
                x['count'] = 0;
            }
        });
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    })
}

function getArchivoAdminByUsers(req, res, next) {
    console.log(req.param.id);
    db.multi(`SELECT * FROM "Archivos" WHERE user_id !='${req.params.id}'`).then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    })
}

//DB FUNCITON - DELETE SPECIFIC DOCUMENT
function deleteArchivoAdmn(req, res, next) {
    db.none(`DELETE FROM "Archivos" WHERE archivo_path='${req.params.id}'`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó el archivo satisfactoriamente.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function getAllUsers(req, res, next) {
    db.multi(`SELECT u.* FROM "Usuarios" u WHERE u.id NOT IN(SELECT uid FROM "Admins") ORDER BY nombre ASC; SELECT ar.user_id, COUNT(ar.id) as Cantidad FROM "Archivos" ar GROUP BY ar.user_id`).then(function (data) {
        data[0].map(x => {
            x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
            return x;
        });
        data[0].forEach(x => {
            var hasNoDoc = true;
            data[1].forEach(y => {
                if (x.id == y.user_id) {
                    x['documentos'] = y.cantidad;
                    hasNoDoc = false;
                }
            });
            if (hasNoDoc) {
                x['documentos'] = 0;
            }
        });
        res.status(200).json(data[0]);
    }).catch(function (err) {
        return next(err);
    });
}

function getEnrollmentList(req, res, next){
    db.multi(`SELECT "Usuarios".id,"Usuarios".nombre, apellido, fecha_nacimiento, correo, telefono, curp, escuela, idcategoria, sexo, tutor_nombre, tutor_correo, tutor_telefono, escuela_tipo, escuela_grado , array_to_string(array_agg("Talleres".nombre), ', ') AS Talleres, COUNT("Archivos".user_id) as documentos FROM "Usuarios" LEFT JOIN "Inscripciones" I on "Usuarios".id = I.user_id LEFT JOIN "Talleres" ON I.taller_id = "Talleres".id LEFT JOIN "Archivos" on "Usuarios".id = "Archivos".user_id WHERE "Usuarios".id NOT IN(SELECT uid FROM "Admins") GROUP BY "Usuarios".id;`).then( (data) => {
        res.status(200).json(data[0]);
    }).catch(function (err) {
        return next(err);
    });
}

function getUser(req, res, next) {
    console.log("aaaaaaaaaaaaaaaaaaaaaaa")
    console.log(req.params)
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
        .then(function (data) {
            data.map(x => {
                x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
                return x;
            })
            res.status(200).json(data);
        }).catch(function (err) {
            return next(err)
        })
}

function getUsersAdmn(req, res, next) {
    db.any(`SELECT distinct u.* FROM "Usuarios" u WHERE u.id IN(SELECT uid FROM "Admins")`)
        .then(function (data) {
            data.map(x => {
                x.fecha_nacimiento = JSON.stringify(x.fecha_nacimiento).split('T')[0].replace(/"/g, "");
                return x;
            })
            res.status(200).json(data);
        }).catch(function (err) {
            return next(err)
        })
}

function getPendingPayments(req, res, next) {
    console.log("trying to get pending");
    db.any(`SELECT u.nombre, u.apellido, i.*, t.nombre as nombreTaller FROM "Inscripciones" i JOIN "Usuarios" u ON i.user_id = u.id JOIN "Talleres" t ON i.taller_id = t.id WHERE i.estatus = 'en revision' and ref_comprobante is not null`)
        .then(function (data) {

            res.status(200).json(data);
        }).catch(function (err) {
            console.log(err)
            //return next(err)
        })
}

function getAcceptedPayments(req, res, next) {
    console.log("trying to get pending");
    db.any(`SELECT u.nombre, u.apellido, i.*, t.nombre as nombreTaller FROM "Inscripciones" i JOIN "Usuarios" u ON i.user_id = u.id JOIN "Talleres" t ON i.taller_id = t.id WHERE i.estatus = 'aceptado' and i.ref_comprobante IS NOT NULL`)
        .then(function (data) {

            res.status(200).json(data);
        }).catch(function (err) {
            console.log(err)
            //return next(err)
        })
}

function addUserAdmin(req, res, next) {
    console.log(req.body.id);
    db.none(`INSERT INTO "Admins"(uid) VALUES ('${req.body.id}')`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Usuario asignado como Administrador correctamente.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function deleteUserAdmin(req, res, next) {
    db.none(`DELETE FROM "Admins" WHERE uid='${req.params.id}'`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó el Administrador satisfactoriamente.'
                });
        })
        .catch(function (err) {
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
    db.none(`INSERT INTO "Usuarios"(id, nombre, apellido, correo, fecha_nacimiento, idcategoria, sexo, tutor_nombre,
        tutor_correo, tutor_telefono, curp, telefono, escuela, escuela_tipo, escuela_grado, id_axtuser, documentos) 
    VALUES('${req.body.id}', '${req.body.nombre}', '${req.body.apellido}', '${req.body.correo}', 
    TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'), assign_category('${req.body.fecha_nacimiento}'), '${req.body.sexo}',
    '${req.body.tutor_nombre}', '${req.body.tutor_correo}', '${req.body.tutor_telefono}', '${req.body.curp}',
    '${req.body.telefono}', '${req.body.escuela}', '${req.body.escuela_tipo}', '${req.body.escuela_grado}',
     '${req.body.id_axtuser}',0)`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado el usuario.'
                });
        })
        .catch(function (err) {
            admin.auth().deleteUser(req.body.id)
                .then(function () {
                    res.status(500).send('¡Ups! Algo ha salido mal. Intenta volver a registrarte.');
                    return next(err);
                })
                .catch(function (error) {
                    res.status(500).send('Favor de contactar al administrador del sistema para registrarse.');
                    return next(error);
                })
        })
}

function updateUserTaller(req, res, next) {

    console.log(req.body);
    console.log(req.params);

    let talleres = "{" + req.body.talleres.toString() + "}";
    console.log(talleres);

    db.none(`UPDATE "Usuarios" SET talleres='${talleres}' ,id_axtuser='${req.body.id_axtuser}' WHERE id='${req.params.id}'`).then(function () {
        res.status(200)
            .json({
                status: 'success',
                message: 'Se ha modificado satisfactoriamente tu inscripción.'
            });
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })

}

function subirComprobante(req, res, next) {
    db.none(`UPDATE "Inscripciones" SET estatus ='en revision', comprobante='${req.body.comprobante}', ref_comprobante='${req.body.ref_comprobante}', mensaje= null WHERE user_id='${req.body.user_id}' AND taller_id='${req.body.taller_id}' `).then(function () {
        res.status(200)
            .json({
                status: 'success',
                message: 'Se ha registrado satisfactoriamente tu comprobante.'
            });
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })

}

function rechazarComprobante(req, res, next) {
    console.log(req.body.voucherInformation);

    db.none(`UPDATE "Inscripciones" SET estatus ='rechazado', mensaje='${req.body.mensaje}', comprobante = null, ref_comprobante=null WHERE user_id='${req.body.user_id}' AND taller_id='${req.body.taller_id}' `).then(function () {
        res.status(200)
            .json({
                status: 'success',
                message: 'Se ha modificado satisfactoriamente tu comprobante.'
            });
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    })

}

function aceptarComprobante(req, res, next) {
    console.log(req.body)
    db.none(`UPDATE "Inscripciones" SET estatus ='aceptado' WHERE user_id='${req.body.user_id}' AND taller_id='${req.body.taller_id}' `).then(function () {
        res.status(200)
            .json({
                status: 'success',
                message: 'Se ha modificado satisfactoriamente tu comprobante.'
            });
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        console.log(err)
        //return next(err);
    })

}

function updateUserComplete(req, res, next) {
    db.none(`UPDATE "Usuarios" SET nombre='${req.body.nombre}', apellido='${req.body.apellido}', fecha_nacimiento=TO_DATE('${req.body.fecha_nacimiento}', 'DD-MM-YYYY'), correo='${req.body.correo}', telefono='${req.body.telefono}', curp='${req.body.curp}', talleres=${req.body.idtaller}, escuela='${req.body.escuela}', idcategoria=${req.body.idcategoria}, sexo='${req.body.sexo}', tutor_nombre='${req.body.tutor_nombre}', tutor_correo='${req.body.tutor_correo}', tutor_telefono='${req.body.tutor_telefono}', escuela_tipo='${req.body.escuela_tipo}', escuela_grado='${req.body.escuela_grado}', ha_participado='${req.body.ha_participado}', beca='${req.body.beca}', detalle_exp='${req.body.detalle_exp}', referencia='${req.body.referencia}', razon_beca='${req.body.razon_beca}' WHERE id='${req.params.id}'`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado satisfactoriamente el usuario.'
                });
        }).catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function removeUser(req, res, next) {
    console.log(req.params.id);
    admin.auth().deleteUser(req.params.id)
        .then(function () {
            db.none(`DELETE FROM "Inscripciones" WHERE user_id='${req.params.id}'`)
                .then(function () {
                    db.none(`DELETE FROM "Usuarios" WHERE id='${req.params.id}'`)
                        .then(function () {
                            res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Se eliminó el usuario satisfactoriamente.'
                                });
                        })
                        .catch(function (err) {
                            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                            return next(err);
                        })
                })
                .catch(function (err) {
                    res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                    return next(err);
                })
        })
        .catch(function (error) {
            res.status(500).send('Favor de contactar al administrador del sistema para registrarse.');
            return next(error);
        })
}


function createInscripcion(req, res, next) {
    let tallerId = parseInt(req.body.tallerId);
    let userId = req.body.userId;
    var costo, estatus;

    db.multi(`SELECT gratis FROM "Talleres" T JOIN "Sedes" S on T.sede = S.id WHERE T.id = ${tallerId}; SELECT escuela_tipo FROM "Usuarios" WHERE id = '${userId}'; SELECT escuela_privada, escuela_publica FROM "CostosTalleres";`)
        .then(function (data) {
            // console.log(data);
            if (data[0][0]["gratis"]) {
                costo = 0;
            } else {
                if (data[1][0]["escuela_tipo"] == "Privada") {
                    costo = data[2][0]["escuela_privada"];
                } else {
                    costo = data[2][0]["escuela_publica"];
                }
            }

            if (costo > 0) {
                estatus = "pendiente";
            } else {
                estatus = "aceptado";
            }

            db.none(`INSERT INTO "Inscripciones"(user_id, taller_id, comprobante, estatus, mensaje, ref_comprobante) VALUES ('${userId}', '${tallerId}', null , '${estatus}' , null, null)`)
                .then(function () {
                    res.status(200)
                        .json({
                            status: 'success',
                            message: 'Se ha inscrito el taller.'
                        });
                })
                .catch(function (err) {
                    res.status(500).send('Ha sucedido un error al inscribir el taller. Intente de nuevo más tarde.');
                    return next(err);
                })
        })
        .catch(function (err) {
            // console.log("error al obtener gratis")
            // console.log(err)
            res.status(500).send('Ha sucedido un error al inscribir el taller. Intente de nuevo más tarde.');
            return next(err);
        })
}

function removeInscripcion(req, res, next) {
    db.result(`DELETE FROM "Inscripciones" WHERE user_id='${req.params.user_id}' AND taller_id=${req.params.taller_id}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó la inscripción.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

//obtener la referencia de un comprobante
function getRefComprobante(req, res, next) {
    db.one(`SELECT ref_comprobante FROM "Inscripciones" WHERE user_id='${req.params.user_id}' AND taller_id=${req.params.taller_id}`).then(function (data) {
            res.status(200).json(data);
        })
        .catch(function (err) {
            res.status(500).send('Error');
            return next(err);
        })
}

//tabla inscripciones
function getTalleresInscritos(req, res, next) {
    db.any(`SELECT I.*, T.*, S.nombre as nombre_sede, S.gratis, S.direccion FROM (("Inscripciones" I JOIN "Talleres" T ON I.taller_id = T.id) JOIN "Sedes" S ON T.sede = S.id) WHERE I.user_id='${req.params.user_id}'`).then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error obteniendo los talleres inscritos. Vuelva a intentar.');
        return next(err);
    });
}


function getAllSponsors(req, res, next) {
    db.any('SELECT * FROM "Patrocinadores"').then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    });
}

function createSponsor(req, res, next) {
    console.log(req.body);
    db.none(`INSERT INTO "Patrocinadores"(nombre, correo) 
    VALUES ('${req.body.nombre}', '${req.body.correo}')`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: '¡Muchas gracias! Lo contactaremos lo más pronto posible.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function removeSponsor(req, res, next) {
    var sedeId = parseInt(req.params.id);
    db.result(`DELETE FROM "Patrocinadores" WHERE id=${sedeId}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó el patrocinador.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function getGuardianByChildId(req, res, next) {
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

function createGuardian(req, res, next) {
    console.log(req.body);
    db.none(`INSERT INTO "Tutores"(nombre, correo, telefono, asignacion) 
    VALUES ('${req.body.nombre}', '${req.body.correo}', '${req.body.telefono}', '${req.body.asignacion}')`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado el tutor.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}
function agregaTutor(req, res, next) {
    console.log(req.body);
    db.one(`INSERT INTO "Tutores"(nombre_tutor, correo_tutor, telefono_tutor) 
    VALUES ('${req.body.nombre_tutor}', '${req.body.correo_tutor}','${req.body.telefono_tutor}')  ON CONFLICT(correo_tutor) DO NOTHING RETURNING id_tutor;`)
        .then(function (data) {
            console.log("AGREGA TUTOR:")
            console.log(data)
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha agregado el tutor..',
                    data: data
                });
        })
        .catch(function (err) {
            console.log("error :(")
            console.log(err)
            res.status(500).send('Ha sucedido un error al crear tutor. Vuelva a intentar.');
            return next(err);
        })
}

function getTutor(req, res, next) {
    db.multi(`SELECT * FROM "Tutores" WHERE id_tutor = '${req.params.id_tutor}'`).then(data => {
        res.status(200).json(data[0][0]);
    })
        .catch(function (err) {
            return next(err);
        })
}

function updateTutor(req, res, next) {
    db.none(`UPDATE "Tutores" SET nombre_tutor = '${req.body.nombre_tutor}', correo_tutor = '${req.body.correo_tutor}', telefono_tutor = '${req.body.telefono_tutor}' WHERE id_tutor = '${req.params.id_tutor}'`).then(() => {
        res.status(200)
            .json({
                status: 'success',
                message: 'Se ha actualizado la información del tutor.'
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            })
    })
}

function createResponsable(req, res, next) {
    // Creates a new Responsable in the Responsables table if the Responsable email does not already exists.
    // If the responsable email is already registered, then do nothing.
    db.none(`INSERT INTO "Responsables"(NOMBRE_RESPONSABLE, CORREO_RESPONSABLE) VALUES ('${req.body.nombre_responsable}','${req.body.correo_responsable}')
    ON CONFLICT(correo_responsable) DO NOTHING;`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado el responsable..'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        });
}

function getIDResponsable(req, res, next) {
    // Get the ID of a Responsable by their email.
    db.multi(`SELECT id_responsable FROM "Responsables" WHERE CORREO_RESPONSABLE = '${req.params.correo_responsable}'`)
        .then(data => {
            res.status(200).json(data[0][0]);
        })
        .catch(function (err) {
            return next(err);
        })
}

function updateResponsable(req, res, next) {
    // Change the email and name of the given Responsable
    db.none(`
    UPDATE "Responsables" SET nombre_responsable='${req.body.nombre_responsable}', correo_responsable='${req.body.correo_responsable}'  where id_responsable='${req.params.id}'
    `)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado el responsable.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error.');
            return next(err);
        })
}

function removeResponsable(req, res, next) {
    // Delete the given responsable
    var id_responsable = parseInt(req.params.id);
    db.result(`DELETE FROM "Responsables" WHERE "id_responsable"=${id_responsable} AND "id_responsable" NOT IN (SELECT responsable FROM "Sedes" WHERE responsable IS NOT NULL)`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se elimino el responsable.'
                });
        })
        .catch(function (err) {
            res.status(500).send(err);
            return next(err);
        })
}


function getSedes(req, res, next) {
    // Get all the Sedes for the Admin to manage
    db.multi(`SELECT * FROM "Sedes" LEFT JOIN "Responsables" R on "Sedes".responsable = R.id_responsable ORDER BY "Sedes".nombre ASC; SELECT * FROM "Talleres"; 
    SELECT COUNT(*) as inscritos, taller_id FROM "Inscripciones" GROUP BY taller_id;`) 
    //data 0 = sedes,  data 1 =  talleres,  data 2 = inscritos
        .then(data => {
            data[1].forEach(el => {
                var registro = true;
                data[2].forEach(x => {
                    //para validacion de cupo
                    if (x.taller_id == el.id) {
                        el['inscritos'] = x.inscritos;
                        registro = false;
                    }
                })
                if (registro) {
                    el['inscritos'] = 0;
                }
            });
            data[0].forEach(element => {
                var talleres = [];
                data[1].forEach(el => {
                    if (element.id === el.sede) {
                        el.gratis = element.gratis; 
                        talleres.push(el);
                    }
                });
                element['talleres'] = talleres;
                talleres = [];
            });
            res.status(200).json(data[0]);
        })
        .catch(function (err) {
            return next(err);
        })
}

function createSede(req, res, next) {
    // Creates a new Sede with or without a Responsable. The Responsable id should be provided in the request.
    if (req.body.responsable == null) {
        db.none(`INSERT INTO "Sedes"(nombre, direccion, responsable, gratis) VALUES ('${req.body.nombre}', '${req.body.direccion}', null, '${req.body.gratis}')`)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Se ha creado la sede.'
                    });
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            });
    }
    else {
        db.none(`INSERT INTO "Sedes"(nombre, direccion, responsable, gratis) VALUES ('${req.body.nombre}', '${req.body.direccion}', '${req.body.responsable}', '${req.body.gratis}')`)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Se ha creado la sede.'
                    });
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            });
    }
}

function updateSede(req, res, next) {
    // Si el responsable no es null le agrega las comillas
    if (req.body.responsable != null) {
        req.body.responsable = `'${req.body.responsable}'`
    }

    db.none(`
    UPDATE "Sedes" SET nombre='${req.body.nombre}', direccion='${req.body.direccion}', responsable=${req.body.responsable}, gratis='${req.body.gratis}' WHERE id=${req.params.id};
    `)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado la sede.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        });
}


function removeSede(req, res, next) {
    var sedeId = parseInt(req.params.id);
    db.result(`DELETE FROM "Sedes" WHERE id=${sedeId}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó la sede.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function getTalleres(req, res, next) {
    db.multi('SELECT * FROM Talleres; SELECT * FROM Sedes; Select * From Categorias')
        .then(data => {
            data[0].map(function (x) {
                data[1].forEach(e => {
                    if (x.sede === e.id) {
                        x['sedeDesc'] = e.nombre;
                        x['ubicacion'] = e.direccion;
                        x['gratis'] = e.gratis; //AGREGADO
                    }
                });
                return x;
            })
            res.status(200).json(data);
        })
        .catch(function (err) {
            return next(err);
        })
}


function getTaller(req, res, next) {
    let taller = parseInt(req.params.id);
    db.multi(`SELECT T.*, S.nombre as sedeDesc, S.direccion, S.id as idSede, S.gratis FROM "Talleres" T JOIN "Sedes" S ON T.sede = S.id WHERE T.id = ${taller}; SELECT COUNT(*) as inscritos FROM "Inscripciones" WHERE taller_id = ${taller};`)
        .then(data => {
            res.status(200).json(data);
        })
        .catch(function (err) {
            return next(err);
        })
}

function getCorreosByTallerId(req, res, next) {
    let query = 'SELECT correo FROM "Usuarios" where id NOT IN (SELECT uid FROM "Admins")';
    let taller = parseInt(req.params.id);
    if (taller > 0) {
        query = `SELECT correo FROM "Usuarios"  where idtaller=${taller}`;
    }
    db.any(query).then(function (data) {
        res.status(200).json(data.map(x => x.correo));
    }).catch(function (err) {
        res.status(500).send('Ha sucedido un error obteniendo la lista de correos correspondientes. Vuelva a intentar.');
        return next(err);
    });
}

function getCostos(req, res, next) {
    db.one('SELECT escuela_privada, escuela_publica FROM "CostosTalleres"').then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    });
}

function updateCostos(req, res, next) {
    db.none(`UPDATE "CostosTalleres" SET escuela_publica='${req.body.escuela_publica}', escuela_privada=${req.body.escuela_privada}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se han modificado los costos.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function createTaller(req, res, next) {
    let string = "{"
    for (let i = 0; i < req.body.url_array.length; i++) {
        string += req.body.url_array[i]
        if (i == req.body.url_array.length - 1) {
            string += "}"
        }
        else {
            string += ","
        }
    }
    let stringPath = "{"
    for (let i = 0; i < req.body.url_array.length; i++) {
        stringPath += req.body.foto_path_array[i]
        if (i == req.body.url_array.length - 1) {
            stringPath += "}"
        }
        else {
            stringPath += ","
        }
    }
    if (req.body.url_array.length < 1) {
        string = "{}"
    }
    if (req.body.foto_path_array.length < 1) {
        stringPath = "{}"
    }

    db.none(`INSERT INTO "Talleres"(nombre, descripcion, sede, categoria, cupo, url_array, foto_path_array,tutor, hora_inicio, hora_fin, fecha_inicio, fecha_fin, estado) 
    VALUES ('${req.body.nombre}', '${req.body.descripcion}', ${req.body.sede}, 9, ${req.body.cupo}, '${string}', '${stringPath}','${req.body.tutor}','${req.body.hora_inicio}','${req.body.hora_fin}','${req.body.fecha_inicio}','${req.body.fecha_fin}','${req.body.estado}')`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado el taller.'
                });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            //return next(err);
        });
}

function updateTaller(req, res, next) {
    let string = "{"
    console.log(req.body);
    for (let i = 0; i < req.body.url_array.length; i++) {
        string += req.body.url_array[i]
        if (i == req.body.url_array.length - 1) {
            string += "}"
        }
        else {
            string += ","
        }
    }
    let stringPath = "{"
    for (let i = 0; i < req.body.url_array.length; i++) {
        stringPath += req.body.foto_path_array[i]
        if (i == req.body.url_array.length - 1) {
            stringPath += "}"
        }
        else {
            stringPath += ","
        }
    }
    if (req.body.url_array.length < 1) {
        string = "{}"
    }
    if (req.body.foto_path_array.length < 1) {
        stringPath = "{}"
    }


    db.none(`UPDATE "Talleres" SET nombre='${req.body.nombre}', descripcion='${req.body.descripcion}', sede=${req.body.sede}, categoria=${req.body.categoria}, cupo= ${req.body.cupo},url_array='${string}',foto_path_array='${stringPath}', tutor='${req.body.tutor}',hora_inicio='${req.body.hora_inicio}', hora_fin='${req.body.hora_fin}',fecha_inicio='${req.body.fecha_inicio}',fecha_fin='${req.body.fecha_fin}',estado='${req.body.estado}' WHERE id=${req.params.id}`)

        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado el taller.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function removeTaller(req, res, next) {
    var sedeId = parseInt(req.params.id);
    // console.log("Trying to delete: ")
    // console.log(req.params.id)
    db.result(`DELETE FROM "Inscripciones" WHERE taller_id=${sedeId}`)
        .then(function (data) {
            db.result(`DELETE FROM "Talleres" WHERE id=${sedeId} RETURNING tutor`)
                .then(function (data) {
                    console.log("Trying to delete following tutor:")
                    console.log(data.rows[0].tutor)
                    db.result(`DELETE FROM "Tutores" WHERE id_tutor=${data.rows[0].tutor}`)
                        .then(function () {
                            res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Se eliminó el taller.'
                                });
                        })
                        .catch(function (err) {
                            res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Se eliminó el taller.'
                                });
                        })
                })
                .catch(function (err) {
                    console.log(err)

                    res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                })
        })
        .catch(function (err) {
            console.log(err)
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        })
}


function getAvisos(req, res, next) {
    /*
    Get all the announcements created in the System for the Admin to see and manage.
    Returns a JSONs with all announcements by Sede, by Talleres and sent to all (General)
    */
    db.multi(`
    SELECT "Avisos".id,"Avisos".sede,"Avisos".taller,"Avisos".general,"Avisos".titulo,"Avisos".mensaje, array_agg("Talleres".nombre) as NombreTalleres, null as NombreSedes FROM "Avisos" LEFT JOIN "Talleres" ON "Talleres".id = ANY("Avisos".taller) WHERE "Avisos".taller NOTNULL GROUP BY "Avisos".id
    UNION
    SELECT "Avisos".id,"Avisos".sede,"Avisos".taller,"Avisos".general,"Avisos".titulo,"Avisos".mensaje, cast(null as text[]) as NombreTalleres, array_agg("Sedes".nombre) as NombreSedes FROM "Avisos" LEFT JOIN  "Sedes" ON "Sedes".id = ANY("Avisos".sede)  WHERE "Avisos".sede NOTNULL GROUP BY "Avisos".id
    UNION
    SELECT "Avisos".id,"Avisos".sede,"Avisos".taller,"Avisos".general,"Avisos".titulo,"Avisos".mensaje, cast(null as text[]) as NombreTalleres, cast(null as text[]) as NombreSedes FROM "Avisos" WHERE "Avisos".general = true GROUP BY "Avisos".id;
    `)
        .then(result => {
            res.status(200).json(result[0]);
        })
        .catch(function (err) {
            return next(err);
        })
}

function getAvisosForUser(req, res, next) {
    /*
    Returns all the general announcements and the ones created for any Sede and Taller in which the user is enrolled. 
    */
    db.multi(`
    SELECT "Avisos".id, "Avisos".titulo, "Avisos".mensaje, '{Aviso general}' as "emisor", 'general' as "tipoEmisor" FROM "Avisos" WHERE "Avisos".general = TRUE
    UNION
    SELECT "Avisos".id, "Avisos".titulo, "Avisos".mensaje, array_agg("Talleres".nombre) as "emisor", 'taller' as "tipoEmisor" FROM "Avisos" JOIN "Inscripciones" ON "Inscripciones".taller_id = ANY("Avisos".taller) JOIN "Talleres" ON "Talleres".id = "Inscripciones".taller_id WHERE "Inscripciones".user_id = '${req.params.id}' GROUP BY "Avisos".id
    UNION
    SELECT "Avisos".id, "Avisos".titulo, "Avisos".mensaje, array_agg("Sedes".nombre) as "emisor", 'sede' as "tipoEmisor" FROM "Avisos" JOIN "Sedes" ON "Sedes".id = ANY("Avisos".sede) WHERE "Sedes".id IN (SELECT "Talleres".sede FROM "Inscripciones" JOIN "Talleres" ON "Talleres".id = "Inscripciones".taller_id WHERE "Inscripciones".user_id = '${req.params.id}') GROUP BY "Avisos".id ORDER BY id desc;;
    `)
        .then(data => {
            res.status(200).json(data[0]);
        })
        .catch(function (err) {
            return next(err);
        })
}

function createAviso(req, res, next) {
    // Allow the administrator to create any kind of announcement (General, by Sede, by Taller)
    if (req.body.general) {
        //Query to create a General announcement
        db.none(`INSERT INTO "Avisos"(titulo, mensaje, general) VALUES ('${req.body.titulo}', '${req.body.mensaje}', TRUE)`)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Se ha creado el aviso.'
                    });
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            })
    } else if (req.body.taller != null && req.body.sede == null) {
        //Query to create an announcement by one or more Taller
        db.none(`INSERT INTO "Avisos"(titulo, mensaje, taller) VALUES ('${req.body.titulo}', '${req.body.mensaje}', ARRAY [${req.body.taller}])`)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Se ha creado el aviso.'
                    });
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            })
    } else if (req.body.taller == null && req.body.sede != null) {
        //Query to create an announcement by one or more Sede
        db.none(`INSERT INTO "Avisos"(titulo, mensaje, sede) VALUES ('${req.body.titulo}', '${req.body.mensaje}', ARRAY [${req.body.sede}])`)
            .then(function () {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'Se ha creado el aviso.'
                    });
            })
            .catch(function (err) {
                res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
                return next(err);
            })
    } else {
        res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
        return next(err);
    }
}

function updateAviso(req, res, next) {
    // Update the title and message of the given announcement.
    db.none(`UPDATE "Avisos" SET titulo='${req.body.titulo}', mensaje='${req.body.mensaje}' WHERE id=${req.params.id}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado el aviso.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function removeAviso(req, res, next) {
    // Delete the given announcement
    var avisoId = parseInt(req.params.id);
    db.result(`DELETE FROM "Avisos" WHERE id=${avisoId}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó el aviso.'
                });
        })
        .catch(function (err) {
            return next(err);
        })
}


function getCategorias(req, res, next) {
    db.multi('SELECT * FROM "Categorias"; SELECT * FROM "Talleres"')
        .then(data => {
            var result = data[0].map(function (x) {
                var talleres = [];
                data[1].forEach(e => {
                    if (x.id === e.categoria) {
                        talleres.push(e.nombre);
                    }
                });
                x['talleres'] = talleres;
                return x;
            })
            res.status(200).json(result);
        })
        .catch(function (err) {
            return next(err);
        })
}

function createCategoria(req, res, next) {
    db.none(`INSERT INTO "Categorias"(nombre, minima, maxima) 
    VALUES ('${req.body.nombre}', ${req.body.minima},  ${req.body.maxima})`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha creado la categoría.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function updateCategoria(req, res, next) {
    db.none(`UPDATE "Categorias" SET nombre='${req.body.nombre}', minima=${req.body.minima}, maxima=${req.body.maxima} WHERE id=${req.params.id}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado la categoría.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Intente no utilizar caracteres especiales y vuelva a intentar.');
            return next(err);
        })
}

function removeCategoria(req, res, next) {
    var catId = parseInt(req.params.id);
    db.result(`DELETE FROM "Categorias" WHERE id=${catId}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se eliminó la categoría.'
                });
        })
        .catch(function (err) {
            return next(err);
        })
}

function getEstatusConvocatorias(req, res, next) {
    db.one('SELECT estatus FROM "Convocatorias"').then(function (data) {
        res.status(200).json(data);
    }).catch(function (err) {
        return next(err);
    });
}

function updateEstatusConvocatorias(req, res, next) {
    db.none(`UPDATE "Convocatorias" set estatus=${req.body.estatus}`)
        .then(function () {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha modificado el estado de las convocatorias.'
                });
        })
        .catch(function (err) {
            res.status(500).send('Ha sucedido un error. Vuelva a intentar.');
            return next(err);
        })
}

function updateUserNumConfPago(req, res, next) {
    db.none(`UPDATE "Usuarios" SET num_conf_pago='${req.body.num_conf_pago}' WHERE id='${req.params.id}'`)
        .then(() => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'Se ha guardado satisfactoriamente tu número de confirmación de pago.'
                })
        })
        .catch(error => {
            console.log("hola");
            console.log(error || error.message);
            res.status(500).send(error);
            return next(error);
        })
}




module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    getUserByEmail: getUserByEmail,
    createUser: createUser,
    updateUserTaller: updateUserTaller,
    removeUser: removeUser,
    getAllSponsors: getAllSponsors,
    createSponsor: createSponsor,
    removeSponsor: removeSponsor,
    getGuardianByChildId: getGuardianByChildId,
    createGuardian: createGuardian,
    getPendingPayments: getPendingPayments,
    getAcceptedPayments: getAcceptedPayments,
    agregaTutor: agregaTutor,
    getTutor: getTutor,
    updateTutor: updateTutor,

    getSedes: getSedes,
    createSede: createSede,
    updateSede: updateSede,
    removeSede: removeSede,
    getCorreosByTallerId: getCorreosByTallerId,
    getTalleres: getTalleres,
    getTaller: getTaller,
    getCostos: getCostos,
    updateCostos: updateCostos,
    createTaller: createTaller,
    updateTaller: updateTaller,
    removeTaller: removeTaller,
    createInscripcion: createInscripcion,
    removeInscripcion: removeInscripcion,
    getTalleresInscritos: getTalleresInscritos,
    getRefComprobante: getRefComprobante,
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
    updateUserComplete: updateUserComplete,
    getArchivosAdmn: getArchivosAdmn,
    createArchivoAdmn: createArchivoAdmn,
    deleteArchivoAdmn: deleteArchivoAdmn,
    getArchivoUser: getArchivoUser,
    getArchivoAdminByUsers: getArchivoAdminByUsers,
    getUsersUsuarios: getUsersUsuarios,
    getUsersAdmn: getUsersAdmn,
    addUserAdmin: addUserAdmin,
    deleteUserAdmin: deleteUserAdmin,
    updateUserNumConfPago: updateUserNumConfPago,
    createResponsable: createResponsable,
    getIDResponsable: getIDResponsable,
    updateResponsable: updateResponsable,
    removeResponsable: removeResponsable,
    aceptarComprobante: aceptarComprobante,
    rechazarComprobante: rechazarComprobante,
    subirComprobante: subirComprobante,
    getEnrollmentList: getEnrollmentList
}

