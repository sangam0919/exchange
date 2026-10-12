const { Model, DataTypes } = require("sequelize");

class Wallet extends Model {
  static init(sequelize) {
    return super.init(
      {
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        publicKey: {
          type: DataTypes.STRING,
          allowNull: false,
        }
      },
      {
        sequelize,
        modelName: "Wallet",
        tableName: "wallets",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId" }); // 외래키 연결
  }
}

module.exports = Wallet;
