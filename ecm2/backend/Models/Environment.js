const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Environment = new Schema({
    environment_name: {
        type: String
    },
    deployment_environment: {
        type: String
    },
    status: {
        type: String
    },
    instanceid: {
        type: String
    }
  },{
        collection: 'environment'
    });

module.exports = mongoose.model('Environment', Environment);