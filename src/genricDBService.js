const debug = require('debug')('app:genricDBService')
const MODELS = require('./models');

module.exports = class GenericDBService {
  constructor(name) {
    if (!this.isValidModelName(name)) throw "Invalid model name '" + name + "'. Terminating app..."

    this.name = name
    this.dbObjects = []
  }

  isValidModelName(name) {
    return !(!name || 0 === name.length || !MODELS.hasOwnProperty(name))
  }

  // Update a record in DB
  updateRecord(criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    dataToSet.updatedAt = (new Date()).toISOString();
    MODELS[this.name].findOneAndUpdate(criteria, dataToSet, options, callback);
  }
  //Update all the records 
  updateAllRecords(criteria,dataToSet,options,callback){
    options.new = true
    options.multi = true
    dataToSet.updatedAt = (new Date()).toISOString();
    MODELS[this.name].update(criteria, dataToSet, options, callback);
  }

  rawUpdateRecord(criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    dataToSet.updatedAt = (new Date()).toISOString();
    MODELS[this.name].updateOne(criteria, dataToSet, options, callback);
  }

  // Insert a record in DB
  createRecord(objToSave, callback) {
    new MODELS[this.name](objToSave).save(callback);
  }

  insertManyAsync(objects, callback) {
    if (objects.length === 0) {
      callback(null, this.dbObjects)
      return this.dbObjects = []
    }

    new MODELS[this.name](objects[0]).save((err, data) => {
      if (err) debug(err)

      this.dbObjects.push(data)
      objects.splice(0, 1)
      this.insertManyAsync(objects, callback)
    });
  }

  // Delete a record in DB
  deleteRecord(criteria, callback) {
    MODELS[this.name].findOneAndRemove(criteria, callback);
  }

  // Get multiple records from DB
  getRecord(criteria, projection, options, callback) {
    options.lean = true;
    MODELS[this.name].find(criteria, projection, options, callback);
  }
}
