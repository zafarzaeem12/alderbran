import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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

const ReviewModel = mongoose.model("review", reviewSchema);

export default ReviewModel;
