module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Transaction', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      coin: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.ENUM('deposit', 'withdraw', 'trade'), allowNull: false },
      amount: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      description: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
      tableName: 'transactions',
      timestamps: false
    });
  };
  