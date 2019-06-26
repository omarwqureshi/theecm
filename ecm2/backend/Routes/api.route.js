//necessary imports and boilerplate
//express and importing the api router
const express = require('express');
const api = express.Router();
//file reader that we will need
//for the environment update script
const fs = require('fs');
//Environments Model that Mongoose will use
//to access MongoDB
const Environment = require('../Models/Environment');
//aws and ec2 object for manipulating AWS
const aws = require('aws-sdk');
aws.config.update({region:'us-west-2'});
const ec2 = new aws.EC2();
//shelljs will be used to call the update shell script
const shell = require('shelljs');

api.use(express.json());

//request for when API calls the environments method
//loops through ec2 instances and pushes this to mongodb
//updates a document if it has changed and upserts if it
//does not exist at all.
api.get( '/environments',(req,res) => { 
    //params that we will use to describe the ec2 instance
    const params = {
        Filters: [
          {
            //filtering the instances by its tag which is the API tag
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
  const instanceids = [];
  const params = {
    Filters: [
      {
      Name:'tag:Group',
      Values:[environment_name]
      }
    ]
  };
  const get = new Promise((resolve, reject) => {
    ec2.describeInstances(params, (err, data) =>{
      if(err){
        reject("error");
      }else{
        resolve("got it");
        console.log(JSON.stringify(data))
        res.send(data);
      }
    });
  }).then(() => console.log("success"))

});

api.post('/stop', (req, res, next) => {
  const environment_name = req.body.environment_name;
  const instanceids = [];
  const p = new Promise()
  const params = {
    InstanceIds: instanceids
  };
});

api.post('./delete', (req, res, next) => {

});

module.exports = api;