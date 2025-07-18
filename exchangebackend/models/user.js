module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      uid: { type: DataTypes.STRING, allowNull: false, unique: true }, // 카카오 고유 ID
      nickname: { type: DataTypes.STRING, allowNull: false }
    }, {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  };
  