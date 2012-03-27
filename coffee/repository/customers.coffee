baseDb = require('./base')
baseRepo = new baseDb.Repository('customers')

{Db, ObjectId, Timestamp, Connection, Server} = baseDb

exports.create = () ->
  baseRepo.create.apply baseRepo, arguments
exports.read = () ->
  baseRepo.read.apply baseRepo, arguments
exports.update = () ->
  baseRepo.update.apply baseRepo, arguments
exports.save = () ->
  baseRepo.save.apply baseRepo, arguments  
exports.remove = () ->
  baseRepo.remove.apply baseRepo, arguments
exports.getById = () ->
  baseRepo.getById.apply baseRepo, arguments
exports.ObjectId = ObjectId
