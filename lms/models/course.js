'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      course.belongsTo(models.user, {
        foreignKey: "instructor_id"
      })

      course.hasMany(models.enrollment, {
        foreignKey: "course_id"
      })

      course.hasMany(models.chapter, {
        foreignKey: "course_id"
      })
    }

// adding course
    static addCourse({ name, description, instructor_id}) {
      return this.create({
        course_name: name,
        description: description,
        instructor_id,
      });
    }

 

// getting courses
    static findCourses() {
      return this.findAll();
    }


  }
  course.init({
    course_name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'course',
  });
  return course;
};