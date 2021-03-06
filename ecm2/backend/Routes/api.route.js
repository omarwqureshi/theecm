const express = require('express');
const api = express.Router();

const Environment = require('../Models/Environment');

const aws = require('aws-sdk');
aws.config.update({region: 'us-west-2'});
const ec2 = new aws.EC2();
const s3 = new aws.S3();
const route53 = new aws.Route53();

const log = console.log;

api.use(express.json());


api.get( '/environments',(_req,res) => { 
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
          console.log("err", err.stack);
        }else{
          for(let i=0;i<data.Reservations.length;i++){
              for(let j=0;j<data.Reservations[i].Instances.length;j++){
                 const environment = {};
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
                      environment, {upsert: true,new: true, runValidators:true,useFindAndModify:false},
                        function (err){
                          if (err){
                            console.log(err);
          
                          }else{
                            //console.log("saved");
                          }
                        })
                 }
                 
                 //res.status(200).send();
              } 
            
          }
        });
      Environment.find((err, data)=>{
                   if(err){
                     console.log(err,err.stack)
                   }else{
                     res.json(data)
                   }
                 })
}); 

api.post('/update', (req, res) => {
  const environment_name = req.body.environment_name;
  res.send(environment_name);
});

api.post('/start', (req, res) => {
  const environment_name = req.body.environment_name;
  const instanceids = [];
  const getEnv = ec2.describeInstances({Filters:[{Name:'tag:Group',Values:[environment_name]}]}).promise();
  getEnv.then((data) =>{
    for(let i=0;i<data.Reservations.length;i++){
      for(let j=0;j<data.Reservations[i].Instances.length;j++){
        instanceids.push(data.Reservations[i].Instances[j].InstanceId);
      }
    }
    return ec2.startInstances({InstanceIds:instanceids}).promise();
  }).then((data)=>{
    console.log(data);
    res.status(200).send();
  }).catch(err=>console.log(err))
  
});

api.post('/stop', (req, res) => {
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

  const getEnv = ec2.describeInstances(params).promise();
  getEnv.then((data) =>{
    for(let i=0;i<data.Reservations.length;i++){
      for(let j=0;j<data.Reservations[i].Instances.length;j++){
        instanceids.push(data.Reservations[i].Instances[j].InstanceId);
      }
    }
    return ec2.stopInstances({InstanceIds:instanceids}).promise();
  }).then((data)=>{
    console.log(data);
    res.status(200).send();
  }).catch(err=>console.log(err))

});

api.post('/delete', (req, res,) => {
   const environment_name = req.body.environment_name;
   const dsp = req.body.deployment_environment;
   const ip = req.body.ip;
   const instanceids = [];
   const name  = environment_name + '.nonprod.appsight.us';
   const name2 = '*.' + environment_name + '.nonprod.appsight.us';
   console.log(name)
   
  const deleteS3 = s3.listObjects({Bucket:"mesmer-nonkub-"+dsp+"-static-content",Prefix:environment_name}).promise()
  .then((data) =>{
    for(let i=0;i<data.Contents.length;i++){
      const str = data.Contents[i].Key;
      if(str.substring(0,str.indexOf("/")) == environment_name){
        return str
      }
    }
    //return s3.deleteObjects({Bucket:"mesmer-nonkub-"+dsp+"static-content", Key:s3key}).promise();
  }).then((str)=>{
    return s3.deleteObjects({Bucket:"mesmer-nonkub-"+dsp+"-static-content",Delete:{Objects:[{Key:str}]}}).promise()
  }).then((data)=>{
    log("success " + data)
  }).catch(err=>log(err))

   const terminateInstances = ec2.describeInstances({Filters:[{Name:'tag:Group',Values:[environment_name]}]}).promise()
   .then((data)=>{
     for(let i=0;i<data.Reservations.length;i++){
       for(let j=0;j<data.Reservations[i].Instances.length;j++){
         instanceids.push(data.Reservations[i].Instances[j].InstanceId);
       }
     }
     return ec2.terminateInstances({InstanceIds:instanceids}).promise();
   }).then((data)=>{
     console.log(data);
   }).catch(err=>console.log(err,err.stack))

   const params = {
    ChangeBatch : {
      Comment: "Generated Appsight deployment",
      Changes:[
          {
              Action: "DELETE",
              ResourceRecordSet: {
                  Name: name,
                  Type: "A",
                  TTL: 600,
                  ResourceRecords: [
                      {
                          Value: ip
                      },
                  ],
              },
          },          
        

      ],

    },
    HostedZoneId: "Z1DA3K8M5IPNAD"
  };
   const params2 = {
    ChangeBatch : {
      Comment: "Generated Appsight deployment",
      Changes:[
          {
              Action: "DELETE",
              ResourceRecordSet: {
                  Name: name2,
                  Type: "A",
                  TTL: 600,
                  ResourceRecords: [
                      {
                          Value: ip
                      },
                  ],
              },
          },          
        

      ],

    },
    HostedZoneId: "Z1DA3K8M5IPNAD"
  };

   const deleteFirstRoute53 =  route53.changeResourceRecordSets(params).promise();
   const deleteSecondRoute53 = route53.changeResourceRecordSets(params2).promise();
   Promise.all([deleteS3, terminateInstances, deleteFirstRoute53, deleteSecondRoute53])
   .then(()=>{
    res.statusCode(200).send();
   }).catch((err)=>res.send(err))
});

//api.get()


module.exports = api;