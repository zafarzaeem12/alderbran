import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
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
    roles_id:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'roles'
    }
  },
  {
    timestamps: true,
  }
);

const ActivityModel = mongoose.model("Activity", ActivitySchema);

export default ActivityModel;
