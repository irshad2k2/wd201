'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("courses", "instructor_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("courses", {
      fields: ["instructor_id"],
      type: "foreign key",
      references: {
        table: "users",
        field: "id",
      },
    });

    await queryInterface.addColumn("chapters", "course_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("chapters", {
      fields: ["course_id"],
      type: "foreign key",
      references: {
        table: "courses",
        field: "id",
      },
    });


    await queryInterface.addColumn("pages", "chapter_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("pages", {
      fields: ["chapter_id"],
      type: "foreign key",
      references: {
        table: "chapters",
        field: "id",
      },
    });


    await queryInterface.addColumn("enrollments", "user_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("enrollments", {
      fields: ["user_id"],
      type: "foreign key",
      references: {
        table: "users",
        field: "id",
      },
    });

    await queryInterface.addColumn("enrollments", "course_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("enrollments", {
      fields: ["course_id"],
      type: "foreign key",
      references: {
        table: "courses",
        field: "id",
      },
    });


    await queryInterface.addColumn("page_progresses", "user_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("page_progresses", {
      fields: ["user_id"],
      type: "foreign key",
      references: {
        table: "users",
        field: "id",
      },
    });

    await queryInterface.addColumn("page_progresses", "page_id", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("page_progresses", {
      fields: ["page_id"],
      type: "foreign key",
      references: {
        table: "pages",
        field: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

