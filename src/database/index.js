import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import Student from '../app/models/Student';
import File from '../app/models/File';
import Plan from '../app/models/Plan';
import Enrollment from '../app/models/Enrollment';

import databaseConfig from '../config/database';

const models = [User, Student, File, Plan, Enrollment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gympoint',
      { userNewUrlParser: true, useFindAndModify: true }
    );
  }
}

export default new Database();
