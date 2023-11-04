'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      chapter.belongsTo(models.course, {
        foreignKey: "course_id"
      })

      chapter.hasMany(models.page, {
        foreignKey: "chapter_id"
      })
    }

    static addChapter({ name, description, courseID }) {
      return this.create({
        chapter_name: name,
        description: description,
        course_id: courseID,
      });
    }

  }
  chapter.init({
    chapter_name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'chapter',
  });
  return chapter;
};