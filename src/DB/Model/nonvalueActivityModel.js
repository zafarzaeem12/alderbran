import mongoose from "mongoose";

const addnonvalueactivitySchema = new mongoose.Schema(
  {
   
    activity_id  :{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Activity'
    },
    description :{
        type : String,
        default : ""
      },
    starttime :{
      type : String,
      default : ""
    },
    endtime :{
        type : String,
        default : ""
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "auth",
      },
      CaseActivity_id : {
        type : mongoose.Schema.Types.ObjectId,
          ref : 'caseActivity'
      },
      
   
  },
  {
    timestamps: true,
  }
);

const nonvalueActivityModel = mongoose.model("nonvalueActivity", addnonvalueactivitySchema);

export default nonvalueActivityModel;
