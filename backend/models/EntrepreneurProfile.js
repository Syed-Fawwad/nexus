import mongoose from 'mongoose';

const entrepreneurProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    startupName: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    fundingNeeded: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    pitchSummary: {
      type: String,
      default: '',
    },
    foundedYear: {
      type: Number,
    },
    teamSize: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const EntrepreneurProfile = mongoose.model('EntrepreneurProfile', entrepreneurProfileSchema);

export default EntrepreneurProfile;
