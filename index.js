var cors = require('cors');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
//const adr = 'mongodb+srv://corpascal:MONG01DB02@cluster0.rtxnf.gcp.mongodb.net';
const adr = 'mongodb+srv://corpascal:MONG01DB02@cluster0.rtxnf.gcp.mongodb.net';
const app = express();

const versionApi = '/api/v1';

// permet d'être appelé depuis n'importe quelle application Front sans problème de cross origin
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// GET /test
app.get(`/test`, (req, res) => {
    let resultObject = {message: "OK"};
    res.json(resultObject);
});

// Récupérer la liste des restos
// GET /api/v1/restos
app.get(`${versionApi}/restos`, (req, res) => {

    var resultObject = {code:-1, message:'aucune opération réalisée'};

    MongoClient.connect(adr, function(err, db) {
        try {
            if (err) throw err;
            var dbo = db.db("restodb");
            dbo.collection("restos").find({}, {_id:0}).toArray(function(err, dataArray) {
                if (err) throw err;

                console.log(dataArray);

                resultObject.code = 0;
                resultObject.message = '';
                resultObject.data = dataArray;
                res.json(resultObject);
                db.close();
            });
        } catch(err) {
            resultObject.code = 1;
            resultObject.message = err.message;
            console.log(err.message);

            res.json(resultObject);
        }
      });

});


// Récupérer un resto
// GET /api/v1/restos/:id
app.get(`${versionApi}/restos/:id`, (req, res) => {

    var resultObject = {code:-1, message:'aucune opération réalisée'};

    MongoClient.connect(adr, function(err, db) {
        try {
            if (err) throw err;
            var dbo = db.db("restodb");
            dbo.collection("restos").find({id: parseInt(req.params.id)}).toArray(function(err, dataArray) {
                if (err) throw err;
                console.log(dataArray);

                if (dataArray.length == 0) {
                    resultObject.code = 1;
                    resultObject.message = `Le restaurant ${req.params.id} n'existe pas!`;
                } else {
                    resultObject.code = 0;
                    resultObject.message = '';
                    resultObject.data = dataArray;
                }
                res.json(resultObject);
                db.close();
            });
        } catch(err) {
            resultObject.code = 1;
            resultObject.message = err.message;
            console.log(err.message);

            res.json(resultObject);
        }
    });

});


// Ajouter un resto
// POST /api/v1/restos
app.post(`${versionApi}/restos`, (req, res) => {
    const data = req.body;

    // id est reçu sous la forme d'un string et il faut l'enregistrer en int
    data.id = parseInt(data.id);

    console.log(data);

    var resultObject = {code:-1, message:'aucune opération réalisée'};

    MongoClient.connect(adr, function(err, db) {
        try {
            if (err) throw err;
            var dbo = db.db("restodb");

            var resInsert = dbo.collection("restos").insertOne(data, function(err, resInsert) {

                console.log(resInsert);

                if (err) {
                    resultObject.code = 1;
                    resultObject.message = err.message;
                    res.json(resultObject);
                } else {
                    resultObject.code = 0;
                    resultObject.message = 'Insertion OK';
                    res.json(resultObject);
                }
                db.close();
            });
        } catch(err) {
            resultObject.code = 1;
            resultObject.message = err.message;
            console.log(err.message);

            res.json(resultObject);
        }


    // res.json(
    //     {data: undefined}
    // );

    });


});


// Mettre à jour un resto
// PUT /api/v1/restos/:id
app.put(`${versionApi}/restos/:id`, (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    console.log(data);

    var resultObject = {code:-1, message:'aucune opération réalisée'};

    MongoClient.connect(adr, function(err, db) {
        if (err) {
            resultObject.code = 1;
            resultObject.message = err.message;
            console.log(err.message);    
            res.json(resultObject);
        } else {
            var dbo = db.db("restodb");

            var myquery = { id: id };
            var newvalues = { $set: {name: data.name, description: data.description} };
            var resUpdate = dbo.collection("restos").updateOne(myquery, newvalues, function(err, resUpdate) {

                console.log(resUpdate);

                if (err) {
                    resultObject.code = 1;
                    resultObject.message = err.message;
                } else {
                    if (resUpdate.matchedCount == 0) {
                        resultObject.code = 1;
                        resultObject.message = 'Maj KO (id inexistant!)';
                    } else {
                        resultObject.code = 0;
                        resultObject.message = 'Maj OK';
                    }
                }
                db.close();
                res.json(resultObject);
            });
        }
    });
});


// Supprimer un resto
// DELETE /api/v1/restos/:id
app.delete(`${versionApi}/restos/:id`, (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    console.log(data);

    var resultObject = {code:-1, message:'aucune opération réalisée'};

    MongoClient.connect(adr, function(err, db) {
        if (err) {
            resultObject.code = 1;
            resultObject.message = err.message;
            console.log(err.message);    
            res.json(resultObject);
        } else {
            var dbo = db.db("restodb");

            var myquery = { id: id };
            var resUpdate = dbo.collection("restos").deleteOne(myquery, function(err, resUpdate) {

                console.log(resUpdate);

                if (err) {
                    resultObject.code = 1;
                    resultObject.message = err.message;
                } else {
                    if (resUpdate.deletedCount == 0) {
                        resultObject.code = 1;
                        resultObject.message = 'Suppression KO (id inexistant!)';
                    } else {
                        resultObject.code = 0;
                        resultObject.message = 'Suppression OK';
                    }
                }
                db.close();
                res.json(resultObject);
            });
        }
    });
});

app.listen(8888, () => console.log('Listening on port 8888'));