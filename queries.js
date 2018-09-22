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
    console.log(req);
    db.none(`INSERT INTO "Usuarios" (user_id, nombre, correo, fecha_nacimiento) 
    VALUES (${user_id}, ${nombre}, ${correo}, ${fecha_nacimiento})`, req.body).
    then(function(){
        res.status(200)
        .json({
            status: 'success',
            message: 'Se ha creado el usuario.'
        });
    })
    .catch(function(err){
        return next(err);
    })
}

module.exports = {
    getAllUsers: getAllUsers,
    getUser: getUser,
    createUser: createUser
}

