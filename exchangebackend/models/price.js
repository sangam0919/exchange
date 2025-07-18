module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Price', {
      coin: { type: DataTypes.STRING, primaryKey: true },
      price: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
      source: { type: DataTypes.STRING },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
      tableName: 'prices',
      timestamps: false
    });
  };
  