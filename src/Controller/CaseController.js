//https://xd.adobe.com/view/dc080871-4098-4891-8322-8a82df51c396-895b/screen/b6589c73-2162-4f9b-84b4-03516568e741?fullscreen
import authModel from "../DB/Model/authModel.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";
// import {mongoose} from "mongoose";
import {generateJWTToken , verifyJWTToken} from '../Utils/jwt.js'
import { accessTokenValidator } from "../Utils/Validator/accessTokenValidator.js";
import NotificationController from "./NotificationController.js";
import jwt from "jsonwebtoken";
import { linkUserDevice, unlinkUserDevice } from "../Utils/linkUserDevice.js";
import { tokenGen } from "../Utils/AccessTokenManagement/Tokens.js";
import OtpModel from "../DB/Model/otpModel.js";
import DeviceModel from '../DB/Model/deviceModel.js';
import { genSalt } from "../Utils/saltGen.js";
import { Types } from "mongoose";
import ActivityModel from '../DB/Model/activityModel.js';
import Forms from '../DB/Model/FormModel.js'
import NonValueActivity from '../DB/Model/nonvalueActivityModel.js'
import RecordingFile from '../DB/Model/RecordingFileModel.js';
import VoiceRecordingModel from '../DB/Model/voiceRecordingModel.js';
import impactibilityModel from '../DB/Model/impactibilityModel.js';
import moment from 'moment';
import CaseActivityModel from '../DB/Model/caseActivityModel.js';
import CaseModel from '../DB/Model/caseModel.js';
import SummaryModel from '../DB/Model/summaryModel.js'
import ReviewModel from "../DB/Model/reviewModel.js";
import mongoose from 'mongoose'
const createForms = async (req,res,next) => {
try{
 
  const auth = req.data.id
  const { 
    roles_id ,
    activityPercentage , 
    nonValueActivity_id ,
    non_value_activityPercentage
  } = req.body
  const Data = {
    roles_id ,
    activityPercentage ,
    nonValueActivity_id,
    non_value_activityPercentage,
    auth
  }
  
  const savedForm = await Forms.create(Data);
  res.status(200).send({
     message : "New Form Activity created",
     status : 1,
     data : savedForm
    })
}catch(err){
  res.status(500).send({
    message : "Internal error",
    status : 0
   })
}
}

const getallForms = async (req,res,next) => {
try{
  const userData = await Forms.find({ auth : req.data.id  })
  res.status(200).send({ 
    message :"Data Fetched Successfully",
    status : 1,
    data :userData
  })
}catch(err){
  res.status(200).send({ 
    message :"Data not Fetched",
    status : 0
  })
}
}

const addNonValueActivity = async (req,res,next) => {
try{
  const { activity_id , description , starttime , endtime} = req.body
  
  // const checkNonActivity = await NonValueActivity.findOne({ activity_id : activity_id   })

  // if(checkNonActivity){
  //   return res.status(404).send({ message : "This non value Activity already exist"})
  // }
  const Data = {
    activity_id,
    description,
    starttime : moment(starttime , "hh:mm A").format("hh:mm A"),
    endtime : moment(endtime , "hh:mm A").format("hh:mm A"),
    user : req.data.id
  }
  const dataAdded = await NonValueActivity.create(Data)
  res.status(201).send({ 
    message : "Non Value Activity added",
    status : 1,
    data : dataAdded
  })
}catch(err){
  res.status(500).send({ 
    message : "Non Activity addedd",
    status : 0
  })
}
}
const getallNonvalueActivity = async (req,res,next) => {
try{
  const alldata = await NonValueActivity.find().populate({path :'activity_id' , select:"title"})
  res.status(200).send({ 
    message : "Non_value Activity data fetched",
    status:1,
    data : alldata
  })
}catch(err){
  res.status(200).send({ 
    message : "No data fetched",
    status: 0
  })
}
}

const createUploaddocuments = async (req, res, next) => {
  try {
    const { id } = req.data;
    let Data = {
      user: id
    };

    if (req.file) {
     
      Data.file = req.file.path.replace(/\\/g, "/");
      Data.fileType = req.file.mimetype || "jpeg";
    } else if (req.body.link) {
     
      Data.link = req.body.link;
    } else {
      // Handle the case where neither an image nor a link is provided
      return res.status(400).send({
        message: "Please provide either a link or an image file.",
        status: 0
      });
    }

    const uploadDocument = await RecordingFile.create(Data);
    res.status(201).send({
      message: "Document created successfully",
      status: 1,
      data: uploadDocument
    });
  } catch (err) {
    return res.status(500).send({
      message: "Error creating document",
      status: 0
    });
  }
};

const createImpactibility = async (req,res,next) => {
try{
  
  const Data = {
    improvementPercentage : req.body.improvementPercentage ,
    session_activity : req.body.session_activity,
    user : req.data.id.toString()
  }
  
  const improvementSession = await impactibilityModel.create(Data)
  

  res.status(201).send({
    message : "Improvementsession created successfully",
    status : 1,
    data : improvementSession
  })
}catch(err){
  console.log(err)
  res.status(500).send({
    message : "no Improvementsession created",
    status : 0
  })
}
}
const getallUserUploads = async (req,res,next) => {
try{
  const alldata = await RecordingFile.findOne({ user : req.data.id});
  res.status(200).send({ 
    message : "userDataUpload fetched successfully",
    status:1,
    data : alldata
  })
}catch(err){
  console.log(err)
  res.status(500).send({ 
    message : "userDataUpload not fetched successfully",
    status:0
  })
}
}

const uploadRecording = async (req,res,next) => {
try{
  
  const Data = {
    file : req.file.path.replace(/\\/g, "/"),
    fileType : req.file.mimetype,
    user : req.data.id
  }
  const recordingSpeaking = await VoiceRecordingModel.create(Data);

  res.status(201).send({
    message : "Voice Recording Uploaded",
    status : 1,
    data : recordingSpeaking
  })
}catch(err){
  console.log(err)
  res.status(500).send({
    message : "SPeak Recording not Uploaded",
    status : 0
  })
}
}
const createCaseActivity = async (req, res, next) => {
  try {
     
     const {
      activity_id,
      description,
      recordings,
      recordingMediaFile,
      Non_Valur,
      imapact,
      form
     }  = req.body

    const Data = {
      activity_id,
      form : form.map((data) => ({ form_id : data.form_id}) ),
      recordings ,
      description,
      imapact : imapact.map((data) => ({ impactibility : data.impactibility})),
      Non_Valur : Non_Valur.map((data) => ({ nonValueActivity : data.nonValueActivity})),
      recordingMediaFile,
    }
    
    const savedCaseAct = await CaseActivityModel.create(Data)
    console.log(savedCaseAct)
    
    const f = form.map(async(data) => {
      if(!data.CaseActivity_id){
        await Forms.updateOne({_id : data.form_id.toString()},{$set : {CaseActivity_id : savedCaseAct._id}},{new : true})
      }else{ null }
    })

    const n = Non_Valur.map(async(data) => {
      if(!data.CaseActivity_id){
        await NonValueActivity.updateOne({_id : data.nonValueActivity.toString()},{$set : {CaseActivity_id : savedCaseAct._id}},{new : true})
      }else{ null }
    })
    const i = imapact.map(async(data) => {
      if(!data.CaseActivity_id){
        await impactibilityModel.updateOne({_id : data.impactibility.toString()},{$set : {CaseActivity_id : savedCaseAct._id}},{new : true})
      }else{ null }
    })

     const r = await RecordingFile.updateOne({_id : Data.recordingMediaFile},{$set : {CaseActivity_id : savedCaseAct._id}},{new : true})

     const v = await VoiceRecordingModel.updateOne({_id : Data.recordings},{$set : {CaseActivity_id : savedCaseAct._id}},{new : true})

    
    
     const combineData = await Promise.all([savedCaseAct ,f,n,i,r,v])


    const [casesActivity] = [...combineData]

   return res.status(201).send({
      message : "Case activity created Successfully",
      status: 1,
      data : casesActivity
    })
  
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error", status: 0 });
  }
};

const createCase = async (req, res, next) => {
  try {
    const checkActivity = await ActivityModel.find().select("_id");
    const checkcaseActivity = await CaseActivityModel.find().select("activity_id -_id");
    const confirmActivity = [...checkActivity, ...checkcaseActivity];


    const isAllActivitiesCompleted = confirmActivity.every((data) =>JSON.stringify(data._id === data.activity_id));
    
    if (isAllActivitiesCompleted) {
      const Data = {
        activity_case: checkcaseActivity.map((data) => ({ Caseactivity_id: data.activity_id })),
        user: req.data.id,
      };

      const CaseReady = await CaseModel.create(Data);
      const SummaryReady = await SummaryModel.create({ Case_id : CaseReady._id , user : req.data.id })
      const ReviewReady = await ReviewModel.create({ Case_id : CaseReady._id , user : req.data.id })

      const allData = await Promise.all([CaseReady , SummaryReady , ReviewReady])

      const [ cases , summary , review] = [...allData]
      return res.status(201).send({
        message: "All activities completed",
        status: 1,
        data: cases
      });
    } else {
      return res.status(404).send({
        message: "You have not completed all your activities yet",
        status: 0,
      });
    }
  } catch (err) {
    console.log("============>",err);
    return res.status(500).send({ message: "Internal error" });
  }
};


const getSummary = async (req,res,next) => {
  const id = new mongoose.Types.ObjectId(req.data.id)
  try{
   const data = [
      {
        $match: {
          user: id,
        },
      },
      {
        $lookup: {
          from: "cases",
          localField: "Case_id",
          foreignField: "_id",
          as: "caseSummary",
        },
      },
      {
        $unwind: {
          path: "$caseSummary",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          seeFormData: {
            $map: {
              input: "$caseSummary.form",
              as: "caseSummaryFroms",
              in: {
                formid: "$$caseSummaryFroms.form_id",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "forms",
          localField: "seeFormData.formid",
          foreignField: "_id",
          as: "FormsDataResult",
        },
      },
      {
        $addFields: {
          seeNonValueData: {
            $map: {
              input: "$caseSummary.Non_Valur",
              as: "caseSummaryNonValue",
              in: {
                nonValueActivity:
                  "$$caseSummaryNonValue.nonValueActivity",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "nonvalueactivities",
          localField:
            "seeNonValueData.nonValueActivity",
          foreignField: "_id",
          as: "non_value_activity_data",
        },
      },
      {
        $addFields: {
          seeImpactibiltyData: {
            $map: {
              input: "$caseSummary.imapact",
              as: "caseSummaryImpact",
              in: {
                impactibility:
                  "$$caseSummaryImpact.impactibility",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "impactibilities",
          localField:
            "seeImpactibiltyData.impactibility",
          foreignField: "_id",
          as: "ImpactDataResult",
        },
      },
      {
        $lookup: {
          from: "recordingfiles",
          localField:
            "caseSummary.recordingMediaFile",
          foreignField: "_id",
          as: "caseImage",
        },
      },
      {
        $lookup: {
          from: "voicerecordings",
          localField: "caseSummary.recordings",
          foreignField: "_id",
          as: "voice",
        },
      },
      {
        $lookup: {
          from: "impactibilities",
          localField: "caseSummary.impactibility",
          foreignField: "_id",
          as: "Impact",
        },
      },
      {
        $unwind: {
          path: "$caseImage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$voice",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$Impact",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: [
          "updatedAt",
          "__v",
          "caseSummary.form",
          "caseSummary.recordings",
          "caseSummary.impactibility",
          "caseSummary.Non_Valur",
          "caseSummary.recordingMediaFile",
          "caseSummary.createdAt",
          "caseSummary.updatedAt",
          "caseSummary.__v",
          "caseSummary.imapact",
          "seeFormData",
          "Non_Value_Activity",
          "seeNonValueData",
          "non_value_activity_data.createdAt",
          "non_value_activity_data.updatedAt",
          "non_value_activity_data.__v",
          "caseImage.createdAt",
          "caseImage.updatedAt",
          "caseImage.__v",
          "voice.createdAt",
          "voice.updatedAt",
          "voice.__v",
          "Impact.createdAt",
          "Impact.updatedAt",
          "Impact.__v",
          "FormsDataResult.createdAt",
          "FormsDataResult.updatedAt",
          "FormsDataResult.__v",
          "ImpactDataResult.createdAt",
          "ImpactDataResult.updatedAt",
          "ImpactDataResult.__v",
          "seeImpactibiltyData"
        ],
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]
    const getSummaryData = await SummaryModel.aggregate(data);

    res.status(200).send({ 
      message : "Summary Fetched Successfully",
      status : 1,
      data : getSummaryData
     })
  }catch(err){
    res.status(500).send({
      message : "no Summary found",
      status : 0
    })
  }
}

const getOneSummary = async (req,res,next) => {
  const id = new mongoose.Types.ObjectId(req.data.id)
  const summaryid = new mongoose.Types.ObjectId(req.params.id)
  try{
    const data = [
      {
        $match: {
          user: id,
          _id : summaryid
        },
      },
      {
        $lookup: {
          from: "cases",
          localField: "Case_id",
          foreignField: "_id",
          as: "caseSummary",
        },
      },
      {
        $unwind: {
          path: "$caseSummary",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          seeFormData: {
            $map: {
              input: "$caseSummary.form",
              as: "caseSummaryFroms",
              in: {
                formid: "$$caseSummaryFroms.form_id",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "forms",
          localField: "seeFormData.formid",
          foreignField: "_id",
          as: "FormsDataResult",
        },
      },
      {
        $addFields: {
          seeNonValueData: {
            $map: {
              input: "$caseSummary.Non_Valur",
              as: "caseSummaryNonValue",
              in: {
                nonValueActivity:
                  "$$caseSummaryNonValue.nonValueActivity",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "nonvalueactivities",
          localField:
            "seeNonValueData.nonValueActivity",
          foreignField: "_id",
          as: "non_value_activity_data",
        },
      },
      {
        $addFields: {
          seeImpactibiltyData: {
            $map: {
              input: "$caseSummary.imapact",
              as: "caseSummaryImpact",
              in: {
                impactibility:
                  "$$caseSummaryImpact.impactibility",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "impactibilities",
          localField:
            "seeImpactibiltyData.impactibility",
          foreignField: "_id",
          as: "ImpactDataResult",
        },
      },
      {
        $lookup: {
          from: "recordingfiles",
          localField:
            "caseSummary.recordingMediaFile",
          foreignField: "_id",
          as: "caseImage",
        },
      },
      {
        $lookup: {
          from: "voicerecordings",
          localField: "caseSummary.recordings",
          foreignField: "_id",
          as: "voice",
        },
      },
      {
        $lookup: {
          from: "impactibilities",
          localField: "caseSummary.impactibility",
          foreignField: "_id",
          as: "Impact",
        },
      },
      {
        $unwind: {
          path: "$caseImage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$voice",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$Impact",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: [
          "updatedAt",
          "__v",
          "caseSummary.form",
          "caseSummary.recordings",
          "caseSummary.impactibility",
          "caseSummary.Non_Valur",
          "caseSummary.recordingMediaFile",
          "caseSummary.createdAt",
          "caseSummary.updatedAt",
          "caseSummary.__v",
          "caseSummary.imapact",
          "seeFormData",
          "Non_Value_Activity",
          "seeNonValueData",
          "non_value_activity_data.createdAt",
          "non_value_activity_data.updatedAt",
          "non_value_activity_data.__v",
          "caseImage.createdAt",
          "caseImage.updatedAt",
          "caseImage.__v",
          "voice.createdAt",
          "voice.updatedAt",
          "voice.__v",
          "Impact.createdAt",
          "Impact.updatedAt",
          "Impact.__v",
          "FormsDataResult.createdAt",
          "FormsDataResult.updatedAt",
          "FormsDataResult.__v",
          "ImpactDataResult.createdAt",
          "ImpactDataResult.updatedAt",
          "ImpactDataResult.__v",
          "seeImpactibiltyData"
        ],
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]
    const getSummaryData = await SummaryModel.aggregate(data);

    res.status(200).send({ 
      message : "Summary Fetched Successfully",
      status : 1,
      data : getSummaryData
     })
  }catch(err){
    res.status(500).send({
      message : "no Summary found",
      status : 0
    })
  }
}

const CaseController = {
  addNonValueActivity :  [verifyJWTToken ,addNonValueActivity ],
  getallNonvalueActivity,
  createForms : [verifyJWTToken ,createForms ],
  getallForms : [verifyJWTToken ,getallForms ],
  createImpactibility : [verifyJWTToken ,createImpactibility ],
  getallUserUploads : [verifyJWTToken ,getallUserUploads ],
  createCaseActivity  : [ verifyJWTToken, createCaseActivity],
  createCase : [ verifyJWTToken, createCase],
  getSummary : [ verifyJWTToken,  getSummary],
  getOneSummary : [ verifyJWTToken,  getOneSummary],
  createUploaddocuments : [
    handleMultipartData.single('file'),
    verifyJWTToken,
    createUploaddocuments,

  ],
  uploadRecording : [
    handleMultipartData.single('file'),
    verifyJWTToken,
    uploadRecording,

  ]
//   completeProfile,
//   verifyProfile,
//   LoginUser,
//   updateUser: [
//     handleMultipartData.fields([
//       { name: 'file', maxCount: 1 },
//       { name: 'coverImageFile', maxCount: 1 }
//     ]),
//     verifyJWTToken,
//     updateUser
//   ],
//   getProfile : [verifyJWTToken ,getProfile ],
//   // changePassword,
//   forgetPassword,
//   VerifyOtp : [verifyJWTToken ,VerifyOtp ],
//   resetpassword : [verifyJWTToken ,resetpassword ] ,
//   Logout : [verifyJWTToken ,Logout ],
//   SocialLoginUser,
//   AdminLogin
  
};

export default CaseController;