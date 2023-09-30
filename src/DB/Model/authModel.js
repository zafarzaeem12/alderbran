import mongoose from "mongoose";
import { hashPassword } from "../../Utils/SecuringPassword.js";

const AuthSchema = mongoose.Schema(
  {
   
    isCompleted: {
      type: Boolean,
      required: true,
      default:false
    },
    isForget:{
      type: Boolean,
      default:false
    },
    isVerified: {
      type: Boolean,
      required: false,
      default:false
    },
    user_authentication:{
      type: String,
      default:""
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: false,
      //unique: true,      
    },
    code: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    notificationOn: {
      type: Boolean,
      default: true,
    },
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "device",
      },
    ],

    otp: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "otp",
      default: null,
    },
    assignIndustry: {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Industry'
    }
  },
  {
    timestamps: true,
  }
);
// AuthSchema.pre("update", function (next) {
//   // do something
//   console.log(this.isModified('password'));
//   if (!this.isModified('password')) return next();
//   this.password = hashPassword(this.password);

//   next(); //dont forget next();
// });
AuthSchema.index({ coordinates: "2dsphere" });
const authModel = mongoose.model("auth", AuthSchema);
export default authModel;
