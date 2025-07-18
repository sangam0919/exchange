module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Wallet', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      coin: { type: DataTypes.STRING, allowNull: false },
      balance: { type: DataTypes.DECIMAL(20, 8), defaultValue: 0 }
    }, {
      tableName: 'wallets',
      timestamps: false
    });
  };
  