// backend/src/models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define attributes interface (exclude timestamps)
interface UserAttributes {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'fia_admin' | 'org_admin' | 'org_user';
  organizationId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

// Define creation attributes
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'lastLoginAt'> {}

// Define the User class with proper typing
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public name!: string;
  public role!: 'fia_admin' | 'org_admin' | 'org_user';
  public organizationId?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  
  // Timestamps - Sequelize adds these automatically
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association property
  public organization?: any;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('fia_admin', 'org_admin', 'org_user'),
      allowNull: false
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

export default User;