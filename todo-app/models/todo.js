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
      // define association here
    }

    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    static getTodos() {
      return this.findAll();
    }

    static overDueTodos() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static dueTodayTodos() {
      return this.findAll({
        where: {
          dueDate: new Date(),
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static dueLaterTodos() {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }
    static completedTodos() {
      return this.findAll({
        where: {
          completed: true,
        },
        order: [["dueDate", "ASC"]],
      });
    }
    setCompletionStatus(completed) {
      const status = completed === true ? false : true;
      return this.update({ completed: status });
    }

    static deleteTodo(id) {
      return this.destroy({
        where: {
          id: id,
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
