"use strict";
const { Model, where } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
      // define association here
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    static getTodos() {
      return this.findAll();
    }

    static overDueTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          completed: false,
          userId,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static dueTodayTodos(userId) {
      return this.findAll({
        where: {
          dueDate: new Date(),
          completed: false,
          userId,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static dueLaterTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: false,
          userId,
        },
        order: [["dueDate", "ASC"]],
      });
    }
    static completedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
        order: [["dueDate", "ASC"]],
      });
    }
    setCompletionStatus(completed) {
      const status = completed === true ? false : true;
      return this.update({ completed: status });
    }

    static deleteTodo(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
