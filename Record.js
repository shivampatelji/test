// Record.js
import { DataTypes, Model } from 'sequelize';
import sequelize from './dbs.js';

class Record extends Model {}

Record.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Record',
    tableName: 'records', // Specify the table name
    timestamps: false, // Set this to true if your table has createdAt and updatedAt columns
  }
);

export default Record;
