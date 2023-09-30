import mongoose from "mongoose";

const caseactivityModelSchema = new mongoose.Schema(
  {
   
    activity_id  :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Activity'
      },
    form : [{
        form_id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'form'
        }
    }],
    recordings :  {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'VoiceRecording'
    },
    description :{ 
        type : String,
        default : ''
    },
    imapact: [{
          impactibility :{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Impactibility'
        }
    }],
    Non_Valur: [{
      nonValueActivity : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'nonvalueActivity'
    },
    }] ,
    recordingMediaFile : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'RecordingFile'
    }
  },
  {
    timestamps: true,
  }
);

const caseActivityModel = mongoose.model("caseActivity", caseactivityModelSchema);

export default caseActivityModel;
