'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      page.belongsTo(models.chapter, {
        foreignKey: "chapter_id"
      });
      page.hasMany(models.page_progress, {
        foreignKey: "page_id"
      })
    }
  }
  page.init({
    page_name: DataTypes.STRING,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'page',
  });
  return page;
};