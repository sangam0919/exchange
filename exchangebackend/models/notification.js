const { Model, DataTypes } = require("sequelize");

class Notification extends Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        message: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM("PROFIT", "LOSS"),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Notification",
        tableName: "notifications",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

module.exports = Notification;
