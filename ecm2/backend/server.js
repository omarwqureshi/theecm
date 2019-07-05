const express = require('express'),
    //path = require('path'),
    //bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    config = require('./database/db');
    

    mongoose.connect(config.db, {useNewUrlParser: true}).then(
        () => {console.log("connected")},
        err => {console.log("cannot connect to db" + err)}
    );

    const app = express();
    app.use(express.json());
    app.use(cors());
    const api = require('./Routes/api.route');


    app.use(cors());
    app.use('/api', api);
    const port = 4000;
    
    app.get('/' ,(req, res) => {
        res.send("hello world");
    });

    // eslint-disable-next-line no-unused-vars
    const server = app.listen(port, function(){
        console.log("listening on port " + port);
    });


    

    