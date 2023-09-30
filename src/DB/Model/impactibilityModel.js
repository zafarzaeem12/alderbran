import mongoose from "mongoose";

const ImpactibilitySchema = new mongoose.Schema(
  {
   
    improvementPercentage  :{
      type : Number,
      default : 0
    },
    session_activity   :{
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

const impactibilityModel = mongoose.model("Impactibility", ImpactibilitySchema);

export default impactibilityModel;
