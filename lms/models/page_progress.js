'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class page_progress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      page_progress.belongsTo(models.user, {
        foreignKey: "user_id"
      });
      page_progress.belongsTo(models.page, {
        foreignKey: "page_id"
      });
    }
  }
  page_progress.init({
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'page_progress',
  });
  return page_progress;
};