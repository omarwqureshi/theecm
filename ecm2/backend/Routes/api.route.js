const express = require('express');
const api = express.Router();
const mongoose  = require('mongoose');

const aws = require('aws-sdk');
const fs = require('fs');

const Environment = require('../Models/Environment');
const log = console.log;

aws.config.update({region:'us-west-2'});
const ec2 = new aws.EC2();

//array of environments that are on AWS
const environments = [Environment];

//request for when API calls the environments method
//loops through ec2 instances and creates an array of Environment objects
//that will be pushed to the mongodb for later manipulation.
api.get( '/environments',(req,res) => { 
    const params = {
        Filters: [
          {
            Name:'tag:Type',
            Values:['api']
          }
        ]
    };
      ec2.describeInstances(params,function handleData(err, data){
        if(err){
          log("err", err.stack);
        }else{
          for(let i=0;i<data.Reservations.length;i++){
              for(let j=0;j<data.Reservations[i].Instances.length;j++){
                 const environment = new Environment();
                 environment.instanceid = data.Reservations[i].Instances[j].InstanceId;
                 environment.status = data.Reservations[i].Instances[j].State.Name;
                 for(let k=0;k<data.Reservations[i].Instances[j].Tags.length;k++){
                     if(data.Reservations[i].Instances[j].Tags[k].Key === "Group"){
                         environment.environment_name = data.Reservations[i].Instances[j].Tags[k].Value;
                     }
                     if(data.Reservations[i].Instances[j].Tags[k].Key === 'Environment'){
                         environment.deployment_environment = data.Reservations[i].Instances[j].Tags[k].Value;
                     }
                    }
                    environments.push(environment);
                 }
              }
            res.send(JSON.stringify(environments));
          }
        }); 
}); 

api.post('/update', (req, res) => {
    const environmentName;
});


api.get('/test', (req, res, next) => {
    console.log("logged");

});

api.post('/start', (req, res, next) => {

});

api.post('./stop', (req, res, next) => {

});

api.post('./delete', (req, res, next) => {

});

module.exports = api;