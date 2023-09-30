import mongoose from "mongoose";

const VoiceRecordingSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      default : ""
    },
    fileType: {
      type: String,
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
  },
);

const VoiceRecordingModel = mongoose.model("VoiceRecording", VoiceRecordingSchema);

export default VoiceRecordingModel;
