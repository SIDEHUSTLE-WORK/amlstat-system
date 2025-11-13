// backend/src/models/Submission.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define attributes interface (exclude timestamps)
interface SubmissionAttributes {
  id: string;
  organizationId: string;
  month: number;
  year: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  indicators: any[];
  filledIndicators: number;
  totalIndicators: number;
  completionRate: number;
  submittedBy?: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  comments?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Define creation attributes
interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 
  'id' | 
  'status' | 
  'indicators' | 
  'filledIndicators' | 
  'totalIndicators' | 
  'completionRate' |
  'submittedBy' | 
  'submittedAt' | 
  'approvedBy' | 
  'approvedAt' | 
  'reviewedBy' | 
  'reviewedAt' | 
  'rejectionReason' | 
  'comments' | 
  'createdBy' | 
  'updatedBy'
> {}

// Define the Submission class with proper typing
export class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: string;
  public organizationId!: string;
  public month!: number;
  public year!: number;
  public status!: 'draft' | 'submitted' | 'approved' | 'rejected';
  public indicators!: any[];
  public filledIndicators!: number;
  public totalIndicators!: number;
  public completionRate!: number;
  public submittedBy?: string;
  public submittedAt?: Date;
  public approvedBy?: string;
  public approvedAt?: Date;
  public reviewedBy?: string;
  public reviewedAt?: Date;
  public rejectionReason?: string;
  public comments?: string;
  public createdBy?: string;
  public updatedBy?: string;
  
  // Timestamps - Sequelize adds these automatically
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public organization?: any;
  public submitter?: any;
  public reviewer?: any;
}

Submission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
      defaultValue: 'draft'
    },
    indicators: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    filledIndicators: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalIndicators: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    completionRate: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    submittedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'submissions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['organizationId', 'month', 'year']
      }
    ]
  }
);

export default Submission;