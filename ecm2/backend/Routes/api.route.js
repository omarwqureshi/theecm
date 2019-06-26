const express = require('express');
const api = express.Router();
const aws = require('aws-sdk');
const fs = require('fs');
const Environment = require('../Models/Environment');
const log = console.log;
aws.config.update({region:'us-west-2'});
const ec2 = new aws.EC2();
const shell = require('shelljs');


//request for when API calls the environments method
//loops through ec2 instances and creates an array of Environment objects
//that will be pushed to the mongodb for later manipulation.

api.use(express.json());

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
                 environment.ip = data.Reservations[i].Instances[j].PublicIpAddress;
                 environment.dnsname = data.Reservations[i].Instances[j].PublicDnsName;
                 for(let k=0;k<data.Reservations[i].Instances[j].Tags.length;k++){
                     if(data.Reservations[i].Instances[j].Tags[k].Key === "Group"){
                         environment.environment_name = data.Reservations[i].Instances[j].Tags[k].Value;
                     }
                     if(data.Reservations[i].Instances[j].Tags[k].Key === 'Environment'){
                         environment.deployment_environment = data.Reservations[i].Instances[j].Tags[k].Value;
                     }
                    }
                    //environments.push(environment);
                    Environment.findOneAndUpdate({environment_name:environment.environment_name},
                      environment, {upsert: true,new: true, runValidators:true},
                        function (err, doc){
                          if (err){
                            log(err);
                          }else{
                            log("saved " + doc);
                          }
                        })
                 }
              }
            res.status(200).send("success");
          }
        });
}); 

api.post('/update', (req, res, next) => {
  const environment_name = req.body.environment_name;
  fs.re
  shell.exec('./initiate-ec2.sh');
  res.send(environment_name);
});

api.post('/start', (req, res, next) => {
  const environment_name = req.body.environment_name;
  const params = {
    Filters: [
      {
      Name:'tag:Group',
      Values:[environment_name]
      }
    ]
  };
  ec2.startInstances(params,function (err, data){
    if(err){
      console.log("Could not start instances", err.stack);
    }else{
      console.log(data);
      res.send(data);
    }
  });

});

api.post('/stop', (req, res, next) => {
  const environment_name = req.body.environment_name;
  
  const params = {
    Filters: [
      {
      Name:'tag:Group',
      Values:[environment_name]
      }
    ]
  };
  ec2.stopInstances(params,function (err, data){
    if(err){
      console.log("Could not start instances", err.stack);
    }else{
      console.log(data);
      res.send(data);
      res.statusCode.send();
    }
  });
});

api.post('./delete', (req, res, next) => {

});

module.exports = api;