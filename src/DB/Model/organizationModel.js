import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      lowercase: true
    },
    status:{
      type:Boolean,
      default : true
    },
    assignedUser:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'auth'
    }
  },
  {
    timestamps: true,
  }
);

const organizationModel = mongoose.model("Organization", organizationSchema);

export default organizationModel;
