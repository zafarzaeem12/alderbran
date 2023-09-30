import mongoose from "mongoose";

const FormSchema = new mongoose.Schema(
  {
   
    roles_id:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'roles'
    },
    activityPercentage :{
      type : Number,
      default : true
    },
    nonValueActivity_id : {
      type : mongoose.Schema.Types.ObjectId,
        ref : 'nonvalueActivity'
    },
    non_value_activityPercentage :{
      type : Number,
      default : true
    },
    auth:{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'auth'
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

const FormModel = mongoose.model("Form", FormSchema);

export default FormModel;
