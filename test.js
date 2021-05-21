process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
const sqlite3 = require('sqlite3').verbose();
let server = require('./app.js');
let expect = chai.expect;

chai.use(chaiHttp);

describe('Gradovi', () => {
  /*   beforeEach((done) => {
        Book.remove({}, (err) => {
           done();
        });
    }); */
  before(() => {
    let db = new sqlite3.Database('./Gradovi.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
      db.run('CREATE TABLE IF NOT EXISTS grad(ID INTEGER, NAZIV TEXT, BROJ_STANOVNIKA INTEGER)');
       db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(1, "Sarajevo", 419957);')
       db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(2, "Mostar", 105797);')
       db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(3, "Banja Luka", 199191);')
       db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(4, "Tuzla", 110979);')
       db.run('INSERT OR REPLACE INTO grad (ID, NAZIV, BROJ_STANOVNIKA) VALUES(5, "Zenica", 110.663);')
    });
  })

  after(() =>{ 

    let db = new sqlite3.Database('./Gradovi.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
      db.run('DELETE FROM grad WHERE ID IN(1, 2, 3, 4, 5);');
    });
  })

  describe('/GET gradovi', () => {
    it('treba prikazati sve gradove', (done) => {
      chai.request(server)
        .get('/gradovi')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body.length).to.be.above(0);
          done();
        });
    });
  });

  describe('/GET gradovi/:id', () => {
    it('treba dobaviti grad po ID-u', (done) => {
      chai.request(server)
        .get('/gradovi/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.ID).to.be.equal(1);
          expect(res.body.NAZIV).to.be.equal("Sarajevo");
          done();
        });
    });
  });


  describe('/POST grad', () => {
    it('treba kreirati novi grad', (done) => {
      const noviGrad = {
        name: "Banja Luka",
        brojStanovnika: 100000
      };

      chai.request(server)
        .post('/grad')
        .send(noviGrad)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.name).to.be.equal(noviGrad.name);
          expect(res.body.brojStanovnika).to.be.equal(noviGrad.brojStanovnika);
          done();
        });
    });
  });

  describe('/PUT gradovi/:id', () => {
    it('treba izmijeniti broj stanovnika', (done) => {
      const noviGrad = {
        brojStanovnika: 100000
      };

      chai.request(server)
        .put('/gradovi/3')
        .send(noviGrad)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.be.equal('success');
          expect(res.body.data.broj).to.be.equal(noviGrad.brojStanovnika);  
          done();
        });
    });
  });

  describe('/DELETE gradovi/:id', () => {
    it('treba izmijeniti broj stanovnika', (done) => {
        chai.request(server)
        .delete('/gradovi/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.a('string');
          expect(res.text).to.be.equal('Grad je obrisan.');
          done();
        });
    });
  });
});