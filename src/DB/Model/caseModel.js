import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    activity_case:[{
        Caseactivity_id:{
          type : mongoose.Schema.Types.ObjectId,
          ref : 'caseActivity'
        }
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  }
);

const SummaryModel = mongoose.model("case", caseSchema);

export default SummaryModel;
