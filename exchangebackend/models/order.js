const { Model, DataTypes } = require("sequelize");

class Order extends Model {
  static init(sequelize) {
    return super.init(
      {
        orderType: {
          type: DataTypes.ENUM("BUY", "SELL"),
          allowNull: false
        },
        amount: {
          type: DataTypes.STRING,
          allowNull: false
        },
        price: {
          type: DataTypes.STRING,
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM("PENDING", "EXECUTED", "FAILED", "CANCELLED"),
          defaultValue: "PENDING"
        },
        executedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        timestamps: true
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

module.exports = Order;
