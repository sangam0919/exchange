const { Model, DataTypes } = require("sequelize");

class Ranking extends Model {
  static init(sequelize) {
    return super.init(
      {
        totalAsset: {
          type: DataTypes.STRING,
          defaultValue: "0"
        },
        profitRate: {
          type: DataTypes.STRING,
          defaultValue: "0"
        }
      },
      {
        sequelize,
        modelName: "Ranking",
        tableName: "ranking",
        timestamps: true
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "userId" });
  }
}

module.exports = Ranking;
