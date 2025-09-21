const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Submission', SubmissionSchema);
