import mongoose from "mongoose";

const IndustrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      lowercase: true
    },
    status:{
      type : Boolean,
      default : true
    },
    // Organization_id:{
    //   type : mongoose.Schema.Types.ObjectId,
    //   ref : 'Organization'
    // }
  },
  {
    timestamps: true,
  }
);

const IndustryModel = mongoose.model("Industry", IndustrySchema);

export default IndustryModel;
