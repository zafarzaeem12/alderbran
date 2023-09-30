import mongoose from "mongoose";

const summarySchema = new mongoose.Schema(
  {
    Case_id:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'case'
    },
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

const SummaryModel = mongoose.model("summary", summarySchema);

export default SummaryModel;
