import fs from "fs";
import bcrypt from "bcrypt";
import authModel from "../DB/Model/authModel.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";
import {mongoose} from "mongoose";
import {generateJWTToken , verifyJWTToken} from '../Utils/jwt.js'
import { accessTokenValidator } from "../Utils/Validator/accessTokenValidator.js";
import NotificationController from "./NotificationController.js";
import jwt from "jsonwebtoken";

import {
  LoginUserValidator,
  RegisterUserValidator,
  ResetPasswordValidator,
  changePasswordValidator,
  createprofilevalidator,
  forgetpasswordValidator,
  updatevalidator,
  verifyOTPValidator,
} from "../Utils/Validator/UserValidator.js";
import { linkUserDevice, unlinkUserDevice } from "../Utils/linkUserDevice.js";
import { tokenGen } from "../Utils/AccessTokenManagement/Tokens.js";
import OtpModel from "../DB/Model/otpModel.js";
import DeviceModel from '../DB/Model/deviceModel.js';
import { genSalt } from "../Utils/saltGen.js";
import { Types } from "mongoose";


const SocialLoginUser = async (req, res, next) => {
  try {
    //const { error } = SocailLoginValidator.validate(req.body);
    // if (error) {
    //   return next(CustomError.badRequest(error.details[0].message));
    // }

    const { deviceToken, deviceType, accessToken, socialType, userType } = req.body;
    const { hasError, message, data } = await accessTokenValidator(accessToken, socialType);
    if (hasError) {
      return next(CustomError.createError(message, 200));
    }
    const { name, image, identifier, dateOfBirth, gender } = data;

    const authmodel = await AuthModel.findOne({ identifier: identifier }).populate("profile");
    if (authmodel) {
      var UserProfile;

      if (authmodel.userType == "Customer") {
        const CustomerProfile = await CustomerModel.find({ auth: authmodel._id }).populate({
          path: "profile",
        });

        CustomerProfile.isCompleteProfile = authmodel.isCompleteProfile;

        const token = await tokenGen(CustomerProfile, "auth", deviceToken);
        // UserProfile = otpResource.BusinessWithToken(CustomerProfile, token);
        UserProfile = { ...CustomerProfile, token };
      }
      if (authmodel.userType == "Instructor") {
        const InstructorProfile = await InstructorModel.find({ auth: authmodel._id }).populate({
          path: "profile",
        });
        InstructorProfile.isCompleteProfile = authmodel.isCompleteProfile;
        const token = await tokenGen(InstructorProfile, "auth", deviceToken);
        // UserProfile = otpResource.WorkerWithToken(InstructorProfile, token);
        UserProfile = { ...InstructorProfile, token };
      }

      const { error } = await linkUserDevice(authmodel._id, deviceToken, deviceType);
      if (error) {
        return next(CustomError.createError(error, 200));
      }
      // const Device = new DeviceModel();
      // Device.deviceType = deviceType;
      // Device.deviceToken = deviceToken;
      // authmodel.devices.push(Device);
      // await authmodel.save();
      // const token = await tokenGen(UserProfile, "auth", deviceToken);
      const respdata = {
        _id: UserProfile._id,
        fullName: UserProfile.fullName,
        follower: UserProfile.follower.length > 0 ? UserProfile.follower.length : 0,
        following: UserProfile.following.length > 0 ? UserProfile.following.length : 0,
        routine: UserProfile.routine,
        nutrition: UserProfile.nutrition,
        dietplane: UserProfile.dietplane,
        userType: authmodel.userType,
        image: await fileUploadModel.findOne({ _id: UserProfile.image }, { file: 1 }),
        isCompleteProfile: authmodel.isCompleteProfile,
        token: UserProfile.token,
      };
      return next(CustomSuccess.createSuccess(respdata, "User Logged In", 200));
    } else {
      // const genOpt = Math.floor(10000 + Math.random() * 90000);
      const authmodel = new AuthModel();
      authmodel.identifier = identifier;
      authmodel.password = password;
      authmodel.userType = userType;
      authmodel.socialId = socialID;
      authmodel.socialType = socialType;
      authmodel.accessToken = accessToken;
      await authmodel.save();

      // const OptSend = await OtpModel.create({
      //   otpKey: genOpt,
      //   auth: authmodel._id,
      //   otpType: "register",
      // });
      // OptSend.save()

      // let subject = "OTP for Registration";
      // let template = await getFileContent(path.join("src", "Static", "create-user.html"));
      // template = template.replace("{{verification}}", OptSend.otpKey);
      // template = template.replace("{{email}}", AuthModel.identifier);
      // sendEmails(AuthModel.identifier, subject, template, (err, data) => {
      //   if (err) {
      //     next(CustomError.badRequest(err.message));
      //   } else {
      //   }
      // });
      var UserModel;
      if (userType == "Customer") {
        UserModel = await CustomerModel.create({
          auth: authmodel._id,
          fullName: name,
        });
        UserModel.save();
      } else {
        UserModel = await InstructorModel.create({
          auth: authmodel.id,
          fullName: name,
        });
        UserModel.save();
      }
      // const NewInAppFeatures = await inAppFeatureModel.create({
      //   userType: user_type == "salon" ? "business" : "worker",
      //   userProfile: UserModel._id,
      // });
      authmodel.profile = UserModel._id;
      await authmodel.save();
      const data = await AuthModel.findById(authmodel._id).populate("profile");

      const token = await tokenGen(data, "auth", deviceToken);

      const respdata = {
        _id: data.profile._id,
        fullName: data.profile.fullName,
        follower: data.profile.follower.length > 0 ? data.profile.length : 0,
        following: data.profile.following.length > 0 ? data.profile.length : 0,
        routine: data.profile.routine,
        nutrition: data.profile.nutrition,
        dietplane: data.profile.dietplane,
        userType: data.userType,
        image: { file: "" },
        isCompleteProfile: data.isCompleteProfile,
        token: token,
      };

      return next(CustomSuccess.createSuccess(respdata, "SignUp successfully", 200));
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};





//complete profile
const completeProfile = async (req, res, next) => {
  try {
    const { name , email, password } = req.body;
    const existingUser = await authModel.findOne({ email });
    console.log("existingUser",existingUser,"email",email)
    const passValidation = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
    if (!name) {
      return next(CustomError.notFound("Name is required"));
    } else if (!password) {
      return next(CustomError.notFound("Password is required"));
    } else if (!password.match(passValidation)) {
      return next(
        CustomError.badRequest(
          "Password should be 8 characters long should contain uppercase, lowercase, numeric and special character"
        )
      );
    }else if(email != existingUser.email){
      return next(
        CustomError.badRequest("DB Email and entered email not matched")
      )
    } else {
       
        const Data = {
          email,
          name ,
          password,
          otpKey: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
          deviceToken: req.body.deviceToken || "asdfghjkl",
        };
        console.log("=====>",Data)
        
        const to = email
        const subject  = `verification code for OTP`
        const html = 
        `
        <html>
        <head>Verification Code</head>
          <body>
            <h1>${subject} </h1>
            <h6> Dear ${Data.name} user your otp code is${Data.otpKey}</h6>
          </body>
        </html>
        `

        const token = generateJWTToken(Data)
        

        sendEmails(to,subject,html,null)
        return next(
          CustomSuccess.createSuccess(
            { token},
            "User created successfully",
            200
          )
        );
      
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};


const verifyProfile = async (req, res, next) => {
  try {
    const { token , otp } = req.body;

    // Check if the email already exists
   
       const UserToken =  await jwt.decode(token);
       const TokenOtp = UserToken.otp
       if(!TokenOtp){
        return next(CustomError.badRequest("Invalid OTP"));
       }
       const Userdata = UserToken.userData
      
   

       const User = await authModel.findOne({ email:Userdata.email });
       console.log(User)
       if (!User) {
         return next(CustomError.badRequest("You are not registered please contact Admin"));
       }

    if(TokenOtp !== otp ){
  return next(CustomError.createError("Invalid OTP", 200));
   }


   const updateUser = await authModel.findByIdAndUpdate(User._id, { isVerified: true, password:Userdata.password }, {
    new: true,
  });

       console.log("TokenOtp" , TokenOtp)
       console.log("Userdata" , Userdata)


    return next(
      CustomSuccess.createSuccess(
        { updateUser },
        "User Verified Succesfully",
        200
      )
    );
 
   
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};



// const updateUser = async (req, res, next) => {
//   try {
//     const data = Object.fromEntries(
//       Object.entries(req.body).filter(([_, v]) => v != null && v !== "" && v !== "null")
//     );

//     const { deviceToken } = req.headers;
//     const { error } = updatevalidator.validate(data);
//     if (error) {
//       return next(CustomError.badRequest(error.details[0].message));
//     }
    
//     const { user } = req;

//     console.log("user UPDATED =>" , user)

//     if (!user) {
//       return next(CustomError.badRequest("User Not Found"));
//     }

//     if (req.files['file']) {
//       // Process 'file' upload if it exists in the request
//       const file = req.files['file'][0];
    
//       if (user.image && user.image.file != null && user.image.file != undefined) {
//         fs.unlink("Uploads/" + user.image.file, (err) => {
//           if (err) {
//             console.error("Error deleting file:", err);
//           }
//         });
//         await fileUploadModel.deleteOne(user.image?._id);
//       }
//       const FileUploadModel = await fileUploadModel.create({
//         file: file.filename,
//         fileType: file.mimetype,
//         user: user._id,
//       });
//       data.image = FileUploadModel._id;
//     }

//     if (req.files['coverImageFile']) {
//       // Process 'coverImageFile' upload if it exists in the request
//       const coverImageFile = req.files['coverImageFile'][0];

//       if (user.coverImage && user.coverImage.file != null && user.coverImage.file != undefined) {
//         fs.unlink("Uploads/" + user.coverImage.file, (err) => {
//           if (err) {
//             console.error("Error deleting file:", err);
//           }
//         });
//         await fileUploadModel.deleteOne(user.coverImage?._id);
//       }
//       const CoverImageModel = await fileUploadModel.create({
//         file: coverImageFile.filename,
//         fileType: coverImageFile.mimetype,
//         user: user._id,
//       });
//       data.coverImage = CoverImageModel._id;
//     }

//     if (data.password) {
//       data.password = hashPassword(data.password);
//     }

//     delete data.long;
//     delete data.lat;

// const updateUser = await authModel.findByIdAndUpdate(user._id, { isCompleted: true, ...data }, {
//       new: true,
//     });

//     const token = await tokenGen(
//       { id: updateUser._id, userType: updateUser.userType },
//       "auth",
//       deviceToken
//     );

//     const userdata = (
//       await authModel.aggregate([
//         {
//           ///$match: { email: email, status: "accepted" },
//           $match: { _id: user._id}
//         },
//         {
//           $lookup: {
//             from: "fileuploads",
//             localField: "image",
//             foreignField: "_id",
//             as: "image",
//           },
//         },
//         {
//           $unwind: {
//             path: "$image",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "fileuploads",
//             localField: "coverImage",
//             foreignField: "_id",
//             as: "coverImage",
//           },
//         },
//         {
//           $unwind: {
//             path: "$coverImage",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $project: {
//             devices: 0,
//             loggedOutDevices: 0,
//             otp: 0,
//             updatedAt: 0,
//             createdAt: 0,
//             __v: 0,
//             isDeleted:0,
//             "image.updatedAt": 0,
//             "image.createdAt": 0,
//             "image.__v": 0,
//             "image.user": 0,
//             "image.fileType": 0,
//             "image._id": 0,
//             "coverImage._id": 0,
//             "coverImage.updatedAt": 0,
//             "coverImage.createdAt": 0,
//             "coverImage.__v": 0,
//             "coverImage.user": 0,
//             "coverImage.fileType": 0,
//           },
//         },
//         { $limit: 1 },
//       ])
//     )[0];

//     return next(
//       CustomSuccess.createSuccess(
//         { ...userdata, token },
//         "Profile updated successfully",
//         200
//       )
//     );
//   } catch (error) {
//     next(CustomError.createError(error.message, 500));
//   }
// };



// const LoginUser = async (req, res, next) => {
//   try {
//     const { error } = LoginUserValidator.validate(req.body);
//     if (error) {
//       return next(CustomError.badRequest(error.details[0].message));
//     }
//     const { email, password, deviceType, deviceToken } = req.body;
//     const AuthModel = (
//       await authModel.aggregate([
//         {
//           ///$match: { email: email, status: "accepted" },
//           $match: { email: email}
//         },
//         {
//           $lookup: {
//             from: "fileuploads",
//             localField: "image",
//             foreignField: "_id",
//             as: "image",
//           },
//         },
//         {
//           $unwind: {
//             path: "$image",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $lookup: {
//             from: "fileuploads",
//             localField: "coverImage",
//             foreignField: "_id",
//             as: "coverImage",
//           },
//         },
//         {
//           $unwind: {
//             path: "$coverImage",
//             preserveNullAndEmptyArrays: true,
//           },
//         },
//         {
//           $project: {
//             devices: 0,
//             loggedOutDevices: 0,
//             otp: 0,
//             updatedAt: 0,
//             createdAt: 0,
//             __v: 0,
//             isDeleted:0,
//             "image.updatedAt": 0,
//             "image.createdAt": 0,
//             "image.__v": 0,
//             "image.user": 0,
//             "image.fileType": 0,
//             "image._id": 0,
//             "coverImage._id": 0,
//             "coverImage.updatedAt": 0,
//             "coverImage.createdAt": 0,
//             "coverImage.__v": 0,
//             "coverImage.user": 0,
//             "coverImage.fileType": 0,
//           },
//         },
//         { $limit: 1 },
//       ])
//     )[0];

//     if (!AuthModel) {
//       return next(CustomError.createError("User Not Found", 200));
//     }

//     const isPasswordValid = comparePassword(password, AuthModel.password);
//     if (!isPasswordValid) {
//       return next(CustomError.badRequest("Invalid Password"));
//     }
//     const device = await linkUserDevice(AuthModel._id, deviceToken, deviceType);
//     if (device.error) {
//       return next(CustomError.createError(device.error, 200));
//     }

//     const token = await tokenGen(
//       { id: AuthModel._id, userType: AuthModel.userType },
//       "auth",
//       deviceToken
//     );

//     return next(
//       CustomSuccess.createSuccess(
//         { ...AuthModel, token },
//         "User Logged In Successfull",
//         200
//       )
//     );
//   } catch (error) {
//     next(CustomError.createError(error.message, 500));
//   }
// };

const LoginUser = async (req,res,next) => {
try{
  const { email , password , deviceToken , deviceType } = req.body
  const existingUser = await authModel.findOne({email : email} );
  if (!email) {
    return next(CustomError.notFound("Email is required"));
  }else if (!password) {
    return next(CustomError.notFound("Password is required"));
  }else if (!deviceToken) {
    return next(CustomError.notFound("Device Token is required"));
  } else if (!deviceType) {
    return next(CustomError.notFound("Device Type is required"));
  }else if (existingUser.isDeleted === true) {
    return next(CustomError.notFound("Your Account is temporaray Blocked"));
  } 
  else{
    
    if(!existingUser){
      return next(CustomError.badRequest("Email not found"));
    }else{
      
      const is_Password_Confirmed = comparePassword(password , existingUser.password)
      
      if(is_Password_Confirmed === true){
        const Data = {
          id : existingUser._id.toString(),
        }
        console.log("Data",Data)
        const token = generateJWTToken(Data)
    
       const data = await authModel.findByIdAndUpdate(
          {_id : existingUser._id.toString()},
          {$set : {user_authentication : token}},
          {new : true}
        )
        const { password : passwords , ...userData } = data._doc
        return next(
          CustomSuccess.createSuccess(
            { userData},
            "User Login Successfully",
            200
          )
        );
      }
    }

  }
}catch(err){
  return next(CustomError.createError(err.message, 500));
}
}

const AdminLogin = async (req,res,next) => {
  try{
       const { email , password  } = req.body
      const existingUser =  await authModel.findOne( { email : email } )
      
      const checkAdmin =  await authModel.findOne({$and : [{ userType : "admin"} , { email : email }] } )
      if(!checkAdmin){
          return res.status(404).send({ message : 'you are not admin'})
      }else{
           const is_Password_Confirmed = comparePassword(password , existingUser.password)
    
    if(is_Password_Confirmed === true){
      const Data = {
        id : existingUser._id.toString(),
      }
      console.log("Data",Data)
      const token = generateJWTToken(Data)
  
     const data = await authModel.findByIdAndUpdate(
        {_id : existingUser._id.toString()},
        {$set : {user_authentication : token}},
        {new : true}
      )
      const { password : passwords , ...userData } = data._doc
      return res.status(201).send({
          message : "Admin Login Successfully",
          status :1,
          data : userData
      })
      }
  }
  }
  catch(err){
       res.status(500).send({
          message : "Admin not Login Successfully",
          status :0
      })
  }
}

const getProfile = async (req, res, next) => {
  try {
   
   const AuthModel =  
   await authModel
   .findById({_id : req.data.id})
   .populate({path :'image' ,select: "file fileType user" })
   .populate({path : 'otp' , select: "otpKey auth" })

    return next(
      CustomSuccess.createSuccess(
        AuthModel,
        "User Information get Successfull",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};



// const forgetPassword = async (req, res, next) => {
//   try {
//     const { error } = forgetpasswordValidator.validate(req.body);
//     if (error) {
//       return next(CustomError.badRequest(error.details[0].message));
//     }
//     const { email } = req.body;

//     const dataExist = await authModel.findOne({
//       email: email,
//       isDeleted: false,
//     });

//     if (!dataExist) {
//       return next(CustomError.badRequest("User Not Found"));
//     }
//     let otp = Math.floor(Math.random() * 90000) + 100000;
//     let otpExist = await OtpModel.findOne({ auth: dataExist._id });
//     if (otpExist) {
//       await OtpModel.findOneAndUpdate(
//         { auth: dataExist._id },
//         {
//           otpKey: await bcrypt.hash(otp.toString(), genSalt),
//           reason: "forgetPassword",
//           otpUsed: false,
//           expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
//         }
//       );
//     } else {
//       otpExist = await OtpModel.create({
//         auth: dataExist._id,
//         otpKey: otp,
//         reason: "forgetPassword",
//         expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
//       });
//       await otpExist.save();
//     }

//     await authModel.findOneAndUpdate({ email }, { otp: otpExist._id });
//     const emailData = {
//       subject: "Aldebaran - Account Verification",
//       html: `
//   <div
//     style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
//   >
//     <img 
//           style="
//           top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
//           src="cid:background" alt="background" 
//     />
//     <div style="z-index:1; position: relative;">
//     <header style="padding-bottom: 20px">
//       <div class="logo" style="text-align:center;">
//         <img 
//           style="width: 150px;" 
//           src="cid:logo" alt="logo" />
//       </div>
//     </header>
//     <main 
//       style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
//     >
//       <h1 
//         style="color: #FD6F3B; font-size: 30px; font-weight: 700;"
//       >Welcome To Aldebaran</h1>
//       <p
//         style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
//       >Hi ${dataExist.name},</p>
//       <p 
//         style="font-size: 20px; text-align: left; font-weight: 500;"
//       > Please use the following OTP to reset your password.</p>
//       <h2
//         style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #FD6F3B; text-align: center; margin-top: 20px; margin-bottom: 20px;"
//       >${otp}</h2>
//       <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
//       style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #FD6F3B;" href = "#"
//       >let us know.</a></p>
//       <p style = "font-size: 20px;">Regards,</p>
//       <p style = "font-size: 20px;">Dev Team</p>
//     </main>
//     </div>
//   <div>
//   `,
//       attachments: [
//         {
//           filename: "logo.png",
//           path: "./Uploads/logo.png",
//           cid: "logo",
//           contentDisposition: "inline",
//         },
//         // {
//         //   filename: "bg.png",
//         //   path: "./Uploads/bg.png",
//         //   cid: "background",
//         //   contentDisposition: "inline",
//         // },
//       ],
//     };
//     await sendEmails(
//       email,
//       emailData.subject,
//       emailData.html,
//       emailData.attachments
//     );
//     const token = await tokenGen(
//       { id: dataExist._id, userType: dataExist.userType },
//       "forgetPassword"
//     );

//     return next(
//       CustomSuccess.createSuccess(
//         { token, otp },
//         "OTP for forgot password is sent to given email",
//         200
//       )
//     );
//   } catch (error) {
//     next(CustomError.createError(error.message, 500));
//   }
// };

// const VerifyOtp = async (req, res, next) => {
//   try {
//     if (req.user.tokenType != "forgetPassword") {
//       return next(
//         CustomError.createError("Token type is not forgot password", 200)
//       );
//     }

//     const { error } = verifyOTPValidator.validate(req.body);
//     if (error) {
//       error.details.map((err) => {
//         next(CustomError.createError(err.message, 200));
//       });
//     }

//     const { otp, deviceToken, deviceType } = req.body;
//     const { email } = req.user;

//     const user = await authModel.findOne({ email }).populate(["otp", "image"]);
//     if (!user) {
//       return next(CustomError.createError("User not found", 200));
//     }
//     const OTP = user.otp;
//     if (!OTP || OTP.otpUsed) {
//       return next(CustomError.createError("OTP not found", 200));
//     }

//     const userOTP = await bcrypt.hash(otp, genSalt);
    

//     if (OTP.otpKey !== userOTP) {
//       return next(CustomError.createError("Invalid OTP", 200));
//     }

//     const currentTime = new Date();
//     const OTPTime = OTP.updatedAt;
//     const diff = currentTime.getTime() - OTPTime.getTime();
//     const minutes = Math.floor(diff / 1000 / 60);
//     if (minutes > 60) {
//       return next(CustomError.createError("OTP expired", 200));
//     }
//     const device = await linkUserDevice(user._id, deviceToken, deviceType);
//     if (device.error) {
//       return next(CustomError.createError(device.error, 200));
//     }
//     const token = await tokenGen(user, "verify otp", deviceToken);

//     const bulkOps = [];
//     const update = { otpUsed: true, otpKey: null };
//     // let  userUpdate ;
//     if (OTP._doc.reason !== "forgetPassword") {
//       bulkOps.push({
//         deleteOne: {
//           filter: { _id: OTP._id },
//         },
//       });
//       // userUpdate.OTP = null;
//     } else {
//       bulkOps.push({
//         updateOne: {
//           filter: { _id: OTP._id },
//           update: { $set: update },
//         },
//       });
//     }
//     OtpModel.bulkWrite(bulkOps);
//     // AuthModel.updateOne({ identifier: user.identifier }, { $set: userUpdate });
//     // user.profile._doc.userType = user.userType;
//     // const profile = { ...user.profile._doc, token };
//     // delete profile.auth;

//     return next(
//       CustomSuccess.createSuccess(
//         { ...user._doc, token },
//         "OTP verified successfully",
//         200
//       )
//     );
//   } catch (error) {
//     if (error.code === 11000) {
//       return next(CustomError.createError("otp not verify", 200));
//     }
//     return next(CustomError.createError(error.message, 200));
//   }
// };

const forgetPassword = async (req,res,next) => {
  try{
    const { email } = req.body
    const existingUser = await authModel.findOne({ email });

    if(!existingUser){
      return next(CustomError.notFound("User not found"));
    }else{
      const to = email
      const subject  = `forgetPassword`
      const Data = {
        email,
        otpKey: Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000,
        deviceToken: req.body.deviceToken || "asdfghjkl",
        subject,
        isForget : true
      };
      console.log("=====>",Data)
    
      const html = 
      `
      <html>
      <head>Verification Code</head>
        <body>
          <h1>${subject} </h1>
          <h6> Dear ${existingUser.name} user your ${subject} otp code is${Data.otpKey}</h6>
        </body>
      </html>
      `

      const token = generateJWTToken(Data)
      

      sendEmails(to,subject,html,null)
      return next(
        CustomSuccess.createSuccess(
          { token},
          "User created successfully",
          200
        )
      );
    
    }

  }catch(err){
    next(CustomError.createError(error.message, 500));
  }
}

const VerifyOtp = async (req,res,next) => {
  
try{
  const { otp , email , deviceType ,deviceToken } = req.body
  if( otp ==  req.data.otpKey && email == req.data.email){
    

    const checkedEmail = await authModel.findOne({email : req.data.email})
    
    if(checkedEmail){
      if(checkedEmail.isForget === false && checkedEmail.isCompleted === true){
       const updateOtp = await authModel.findByIdAndUpdate(
          { _id : checkedEmail._id},
          { $set : { isForget: true}},
          { new : true }
        )

        const otpData={
          otpKey : req.data.otpKey,
          auth : updateOtp._id,
          otpUsed : true,
          reason : req.data. subject
        }

        const checked_otp =  await OtpModel.findByIdAndUpdate({_id : checkedEmail.otp},{$set : otpData },{ new : true});
        const { otpKey , auth } = checked_otp
        const { email } = checkedEmail

        const Data = {
          otpKey,
           auth :auth.toString(),
          email
        }
        
        const token = generateJWTToken(Data)
        
        return next(
          CustomSuccess.createSuccess(
            { token},
            "OTP verified",
            200
          )
        );
      }
      else{
        const verifyEmail = await authModel.findOne({ email : req.data.email})
        const hashedPassword = hashPassword(req.data.password);
            const Data ={
              name : req.data.name,
              email : verifyEmail.email,
              password : hashedPassword,
              isVerified : true,
              isCompleted : true
            }
          const newUser = await authModel.findByIdAndUpdate(
            {_id : verifyEmail._id},
            { $set : Data },
            {new : true}
            )
         
          const otpData={
            otpKey : req.data.otpKey,
            auth : newUser._id.toString(),
            otpUsed : true,
            reason : 'verification'
          }
  
          const checked_otp = await OtpModel.create(otpData)
  
          
      
          const userDevices = {
            deviceToken: deviceToken  ||  req.data.deviceToken,
            user : newUser._id,
            deviceType : deviceType
          }
      
          const device = await DeviceModel.create(userDevices)
      
          const fetchedUser = await authModel.findByIdAndUpdate(
            {_id : newUser._id} , 
            { 
              $set : {otp : checked_otp._id} ,
              $push: { devices: device._id},
            } , 
            {new : true});
          const { password : passwords , ...others} = fetchedUser._doc
      
     
          return next(
            CustomSuccess.createSuccess(
              { others},
              "User Profile completed and Verified successfully",
              200
            )
          );
        
      }
    }
    

    }else{
    return next(CustomError.internal("Data not found", 500));
  }
}catch(err){
  return next(CustomError.createError(err.message, 500));
}
}

const resetpassword = async (req,res,next) => {
try{
  const { email } = req.data
  const { password } = req.body
  const checked_user = await authModel.findOne({email});

  const isPassword_confirm =  hashPassword(password)
 
  const changepassword = await authModel.findByIdAndUpdate(
    {_id : checked_user._id},
    {$set : {password : isPassword_confirm ,isForget :false}},
    {new : true}
    );
    return next(
      CustomSuccess.createSuccess(
        { changepassword},
        "Password reset successfully",
        200
      )
    );
}catch(err){
  return next(CustomError.createError(err.message, 500));
}
}

const Logout = async (req,res,next) => {
try{
   const userData = await authModel.findOne({_id : req.data.id});
  
   const userLogout = await authModel.updateOne(
    {_id : userData._id},
    {$set : {user_authentication : ""}},
    {new :true}
    )
    console.log(userLogout)
    const {acknowledged , modifiedCount } = userLogout;

    if(acknowledged === true && modifiedCount === 1){
      res.status(200).json({ message: "Logout Successfully" });
    }else {
      
      res.status(404).json({ message: "No User found" });
    }

}catch(err){
  return next(CustomError.createError( "No User found", 500));
}
}

const updateUser = async (req,res,next) => {
try{
  
  const ImageData = {
    file : req.files ? req.files.file.map((data) => data.path.replace(/\\/g, "/")).join(', ') : null,
    fileType : req.files ? req.files.file.map((data) => data.mimetype).join(', ') : null,
    user :  req.data.id
  }
 

  const imageDatas = await fileUploadModel.create(ImageData)

  
 const updatedData = await authModel.findByIdAndUpdate(
  {_id : req.data.id},
  {$set : { 
    name : req.body.name,
    phone : req.body.phone,
    image: imageDatas._id
 
  }},
  { new : true }
  );
  
  return next(
    CustomSuccess.createSuccess(
      { updatedData },
      "User Updated Succesfully",
      200
    )
  );
}catch(err){
  next(CustomError.createError(error.message, 500));
}
}

// const resetpassword = async (req, res, next) => {
//   try {
//     if (req.user.tokenType != "verify otp") {
//       return next(
//         CustomError.createError("First verify otp then reset password", 200)
//       );
//     }
//     const { error } = ResetPasswordValidator.validate(req.body);

//     if (error) {
//       error.details.map((err) => {
//         next(err.message, 200);
//       });
//     }

//     // const { devicetoken } = req.headers;

//     const { email } = req.user;
//     // if (req.user.devices[req.user.devices.length - 1].deviceToken != devicetoken) {
//     //   return next(CustomError.createError("Invalid device access", 200));
//     // }

//     const updateuser = await authModel.findOneAndUpdate(
//       { email },
//       {
//         password: await bcrypt.hash(req.body.password, genSalt),
//         otp: null,
//       },
//       { new: true }
//     );

//     // if (!updateuser) {
//     //   return next(CustomError.createError("password not reset", 200));
//     // }

//     const user = await authModel.findOne({ email }).populate("image");
//     const token = await tokenGen(user, "auth", req.body.deviceToken);

//     const profile = { ...user._doc, token };
//     delete profile.password;

//     return next(
//       CustomSuccess.createSuccess(profile, "password reset succesfully", 200)
//     );
//   } catch (error) {
//     if (error.code === 11000) {
//       return next(CustomError.createError("code not send", 200));
//     }
//     return next(CustomError.createError(error.message, 200));
//   }
// };

// const logout = async (req, res, next) => {
//   try {
//     const { deviceType, deviceToken } = req.body;

//     unlinkUserDevice(req.user._id, deviceToken, deviceType);
//     return next(
//       CustomSuccess.createSuccess({}, "User Logout Successfully", 200)
//     );
//   } catch (error) {
//     return next(CustomError.createError(error.message, 200));
//   }
// };
const AuthController = {
  completeProfile,
  verifyProfile,
  LoginUser,
  updateUser: [
    handleMultipartData.fields([
      { name: 'file', maxCount: 1 },
      { name: 'coverImageFile', maxCount: 1 }
    ]),
    verifyJWTToken,
    updateUser
  ],
  getProfile : [verifyJWTToken ,getProfile ],
  // changePassword,
  forgetPassword,
  VerifyOtp : [verifyJWTToken ,VerifyOtp ],
  resetpassword : [verifyJWTToken ,resetpassword ] ,
  Logout : [verifyJWTToken ,Logout ],
  SocialLoginUser,
  AdminLogin
  
};

export default AuthController;