import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
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
    Industry_id:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Industry'
    }
  },
  {
    timestamps: true,
  }
);

const RoleModel = mongoose.model("roles", RoleSchema);

export default RoleModel;
