module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Order', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM('buy', 'sell'), allowNull: false },
      coin: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      status: {
        type: DataTypes.ENUM('open', 'partial', 'filled', 'canceled'),
        defaultValue: 'open'
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
      tableName: 'orders',
      timestamps: false
    });
  };
  