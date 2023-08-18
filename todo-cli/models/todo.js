// models/todo.js
const { Op } = require("sequelize");
("use strict");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      console.log(
        (await this.overdue()).map((n) => n.displayableString()).join("\n"),
      );
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      console.log(
        (await this.dueToday()).map((n) => n.displayableString()).join("\n"),
      );
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      console.log(
        (await this.dueLater()).map((n) => n.displayableString()).join("\n"),
      );
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      try {
        const todoOverdue = Todo.findAll({
          order: [["id", "ASC"]],
          where: {
            dueDate: {
              [Op.lt]: new Date(),
            },
          },
        });
        return todoOverdue;
      } catch (error) {
        console.error(error);
      }
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      try {
        const todoToday = Todo.findAll({
          order: [["id", "ASC"]],
          where: {
            dueDate: new Date(),
          },
        });
        return todoToday;
      } catch (error) {
        console.error(error);
      }
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      try {
        const todoLater = Todo.findAll({
          order: [["id", "ASC"]],
          where: {
            dueDate: {
              [Op.gt]: new Date(),
            },
          },
        });
        return todoLater;
      } catch (error) {
        console.error(error);
      }
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      try {
        await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          },
        );
      } catch (error) {
        console.error(error);
      }
    }

    displayableString() {
      let d = new Date().toISOString().split("T")[0];
      let checkbox = this.completed ? "[x]" : "[ ]";
      return (
        `${this.id}. ${checkbox} ${this.title}` +
        (this.dueDate === d ? "" : ` ${this.dueDate}`)
      );
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
