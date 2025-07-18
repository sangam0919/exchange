const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL || 'mysql://root:password@localhost:3306/exchange', {
  logging: false,
});

const User = require('./user')(sequelize, DataTypes);
const Wallet = require('./wallet')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const Trade = require('./trade')(sequelize, DataTypes);
const Transaction = require('./transaction')(sequelize, DataTypes);
const Price = require('./price')(sequelize, DataTypes);

// 관계 설정
User.hasMany(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(Trade, { foreignKey: 'buy_order_id' });
Order.hasMany(Trade, { foreignKey: 'sell_order_id' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Wallet,
  Order,
  Trade,
  Transaction,
  Price
};


sequelize.sync({ alter: true }) 
  .then(() => {
    console.log('📦 All tables synced successfully.');
  })
  .catch(err => {
    console.error('❌ Table sync error:', err);
  });

