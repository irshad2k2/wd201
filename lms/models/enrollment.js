'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class enrollment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      enrollment.belongsTo(models.user, {
        foreignKey: "user_id"
      })

      enrollment.belongsTo(models.course, {
        foreignKey: "course_id"
      })
    }
  }
  enrollment.init({
    status: DataTypes.BOOLEAN,
    progress: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'enrollment',
  });
  return enrollment;
};