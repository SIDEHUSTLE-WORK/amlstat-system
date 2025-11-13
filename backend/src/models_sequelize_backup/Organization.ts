// backend/src/models/Organization.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define attributes interface (exclude timestamps - Sequelize adds them)
interface OrganizationAttributes {
  id: string;
  code: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  contactPerson: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
}

// Define creation attributes (fields optional during creation)
interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'isActive' | 'createdBy' | 'updatedBy'> {}

// Define the Organization class with proper typing
export class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public type!: string;
  public email!: string;
  public phone!: string;
  public contactPerson!: string;
  public isActive!: boolean;
  public createdBy?: string;
  public updatedBy?: string;
  
  // Timestamps - Sequelize adds these automatically
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'organizations',
    timestamps: true
  }
);

export default Organization;