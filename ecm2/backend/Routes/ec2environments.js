const log = console.log;
const AWS = require('aws-sdk');
const fs = require('fs');


AWS.config.update({region: 'us-west-2'});
const ec2 = new AWS.EC2();

  
  // Call EC2 to retrieve policy for selected bucket

const environments = () => {
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
      log(data);
    }
  });
  
}

// function handleData(err, data, callback){
//   //var environmentList = [];
//   if(err){
//     log("error", err.stack);
//   }else{
//     return data;
//   }

// }


function startEnvironment(){

}

function stopEnvironment(){

}

function deleteEnvironment(){

}

module.exports = { stopEnvironment, deleteEnvironment, environments};


