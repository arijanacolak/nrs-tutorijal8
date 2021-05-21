var http = require('http');
var fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
var express = require('express');
var path = require("path");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.json());
var server = http.createServer(app);

//ukoliko baza nije kreirana potrebno je dva puta pokrenuti app.js (prvi put se kreira baza, drugi put tabela)
let db = new sqlite3.Database('./Gradovi.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    db.run('CREATE TABLE IF NOT EXISTS grad(ID INTEGER, NAZIV TEXT, BROJ_STANOVNIKA INTEGER)');
   /* db.run('INSERT INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(1, "Sarajevo", 419957);')
    db.run('INSERT INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(2, "Mostar", 105797);')
    db.run('INSERT INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(3, "Banja Luka", 199191);')
    db.run('INSERT INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(4, "Tuzla", 110979);')
    db.run('INSERT INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(5, "Zenica", 110.663);')*/
    console.log('Spojeni na bazu Gradovi.');
  });
  app.get('/', function(req,res){
    res.send("<h3>Za spisak gradova iz baze po ID-u idite na: 'http://localhost:3000/gradovi/ID_Broj' <h3>");
  });
 
app.use(bodyParser.urlencoded({extended: false}));

app.get('/grad', function(req,res){
  res.sendFile(path.join(__dirname,'/dodavanje_grada.html'));
});

app.post('/grad', function(req,res){
  db.serialize(()=>{
    db.run('INSERT INTO grad(NAZIV, BROJ_STANOVNIKA) VALUES(?,?)', [req.body.name, req.body.brojStanovnika], function(err,row) {
      if (err) {
        return console.log(err.message);
      }
      console.log("Novi grad je dodan.");
      res.send({
        name: req.body.name,
        brojStanovnika: req.body.brojStanovnika
      });
    });
  });
});

app.get('/gradovi', function(req,res){
  var data = [];
  db.serialize(()=>{
    let sql = `SELECT DISTINCT id ID, naziv NAZIV, broj_stanovnika BROJ_STANOVNIKA FROM grad
           ORDER BY ID`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err; }
      res.send(rows);
    });
  });
});

  app.get('/gradovi/:id', function(req,res){
    db.serialize(()=>{
      //kada trebamo vise redova koristimo each umjesto get ispod
      db.get('SELECT id ID, naziv NAZIV, broj_stanovnika BROJ_STANOVNIKA FROM grad WHERE id =?', [req.params.id], function(err,row){     
        if(err){
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        if(row.ID !== 'undefined') res.send(row);
        else res.send({message: 'Grad sa poslanim ID-em ne postoji u bazi.'});
        console.log("Entry displayed successfully");
      });
    });
  });

  app.put('/gradovi/:id', (req, res) => {
    //var broj = req.body.brojStanovnika;
    var data = {
      broj: req.body.brojStanovnika
  }
  db.run(
      `UPDATE grad set BROJ_STANOVNIKA=? WHERE id=?`,[data.broj, req.params.id],
      function (err) {
          if (err){
              res.status(400).json({"error": res.message})
              return;
          }
          res.json({
              message: "success",
              data: data
          })
  });
  });

  app.delete('/gradovi/:id', (req, res) => {
    db.serialize(()=>{
      db.run(`DELETE FROM grad WHERE id=?`, [req.params.id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        res.send("Grad je obrisan.")
      });
    });
  });
  
/*var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var myReadStream = fs.createReadStream(__dirname + '/index.html', 'utf-8');
    myReadStream.pipe(res);
});*/

server.listen(5001);
console.log('Osluškujem na portu 5001...');

module.exports = server