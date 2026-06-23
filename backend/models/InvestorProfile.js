import mongoose from 'mongoose';

const investorProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    investmentInterests: {
      type: [String],
      default: [],
    },
    investmentStage: {
      type: [String],
      default: [],
    },
    portfolioCompanies: {
      type: [String],
      default: [],
    },
    totalInvestments: {
      type: Number,
      default: 0,
    },
    minimumInvestment: {
      type: String,
    },
    maximumInvestment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const InvestorProfile = mongoose.model('InvestorProfile', investorProfileSchema);

export default InvestorProfile;
