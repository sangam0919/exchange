const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        // s기본 키 id 명시적으로 추가 (이게 없어서 외래키 연결이 실패한 거야!)
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        uid: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        nickname: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true
      }
    );
  }

  static associate(models) {
    this.hasOne(models.Wallet, { foreignKey: "userId" });
    this.hasMany(models.Order, { foreignKey: "userId" });
    this.hasOne(models.Ranking, { foreignKey: "userId" });
  }
}

module.exports = User;
