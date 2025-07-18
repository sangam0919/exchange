module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Trade', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      buy_order_id: { type: DataTypes.INTEGER, allowNull: false },
      sell_order_id: { type: DataTypes.INTEGER, allowNull: false },
      coin: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      fee: { type: DataTypes.DECIMAL(20, 8), defaultValue: 0 },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
      tableName: 'trades',
      timestamps: false
    });
  };
  