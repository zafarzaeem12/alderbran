import mongoose from "mongoose";

const RecordingFileSchema = new mongoose.Schema(
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
    link : {
      type: String,
      default : ""
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

const RecordingFileModel = mongoose.model("RecordingFile", RecordingFileSchema);

export default RecordingFileModel;
