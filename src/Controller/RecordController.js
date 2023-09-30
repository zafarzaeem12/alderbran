import EventModel from "../DB/Model/eventModel.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import RecordModel from "../DB/Model/recordModel.js";
import NotificationController from "./NotificationController.js";
import mongoose from "mongoose";


const createRecord = async (req, res, next) => {
    try {
      const { user } = req;
      const file = [];
  
      const { recordType,
         title,
          description,
           maturity,
            industry,
             audio,
              jobRole,
               file: files,
                coverImage,
                 startTime,
                  endTime } = req.body;
  
      const Record = new RecordModel({
        recordType,
        title,
        description,
        maturity,
        industry: industry ? mongoose.Types.ObjectId(industry) : null,
        audio: audio ? mongoose.Types.ObjectId(audio) : null,
        jobRole,
        file: files ? files.map((file) => mongoose.Types.ObjectId(file)) : [],
        user: user._id ? mongoose.Types.ObjectId(user._id) : null,
        coverImage: coverImage ? mongoose.Types.ObjectId(coverImage) : null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
      });
  
      await Record.save();
  
      return next(CustomSuccess.createSuccess(Record, "Record Created", 200));
    } catch (err) {
      console.log(err);
      return next(CustomError.createError("Can't Create New Record Or You are not authorized", 404));
    }
  };
  
// const getPublicRecord = async (req, res, next) => {
//     try {
    
//       const Records = await RecordModel.find({RecordType:"public"})
//         .populate({
//           path: "creator",
//           select: {name:1},        
//           populate: { path: "image", select: "file" },        
//         })      
//         .populate("file", "file")
//         .populate("players");
//       return next(
//         CustomSuccess.createSuccess(Records, "Events  successfully", 200)
//       );
//     }
//     catch (err) {
//       console.error(err);
//       return next(CustomError.createError(err.message, 500));
//     }
//   };

//   const getPrivateRecord = async (req, res, next) => {
//     try {
    
//       const Records = await RecordModel.find({RecordType:"private"})
//         .populate({
//           path: "creator",
//           select: {name:1},        
//           populate: { path: "image", select: "file" },        
//         })      
//         .populate("file", "file");
//       return next(
//         CustomSuccess.createSuccess(Records, "Events  successfully", 200)
//       );
//     }
//     catch (err) {
//       console.error(err);
//       return next(CustomError.createError(err.message, 500));
//     }
//   };

//   const joinRecord = async (req, res, next) => {
//     const { user } = req;
//     const { id } = req.params;
//     const password = req.body.password; // Assuming the password is provided in the request body
  
//     try {
//       const getRecord = await RecordModel.findById(id);
  
//       if (!getRecord) {
//         return res.status(404).send("Record not found"); // Handle if the Record doesn't exist
//       }
  
//       if (getRecord.RecordType === "private") {
//         if (!password || getRecord.password !== password) {
//           return res.status(401).send("Invalid password"); // Ask for password and handle incorrect password
//         }
  
//         if (getRecord.players.includes(user._id)) {
//           return res.status(400).send("Already joined the Record"); // Handle if user is already in the players array
//         }
  
//       } else if (getRecord.RecordType === "public") {
//         // Handle public Record
//         if (getRecord.players.includes(user._id)) {
//           return res.status(400).send("Already joined the Record"); // Handle if user is already in the players array
//         }
//       } else {
//         return res.status(400).send("Invalid RecordType"); // Handle if the RecordType is neither private nor public
//       }
  
//       const updatedRecord = await RecordModel.findByIdAndUpdate(
//         id,
//         { $push: { players: user._id } },
//         { new: true }
//       );
  
//       return next(
//         CustomSuccess.createSuccess(
//           updatedRecord,
//           "Record Joined Successfully",
//           200
//         )
//       );
  
//       // Continue with joining the Record if it is private and the password is correct
//       // ...
  
//     } catch (error) {
//       next(error);
//     }
//   };
  
//   const leftRecord = async (req, res, next) => {
  
//     const { id } = req.params;
//     const { user } = req;
    
  
//     // const sendnotification = await NotificationController.createNotification({
//     //   type: "Event",
//     //   title: "Removed from Event",
//     //   description: "You have been removed from the event",
//     //   link: "https://example.com/profile",
//     //   user: user._id,
//     // });



//     try {

//       const getRecord = await RecordModel.findById(id);
  
//       if (!getRecord) {
//         return res.status(404).send("Record not found"); // Handle if the Record doesn't exist
//       }

//       if (!getRecord.players.includes(user._id)) {
//         return res.status(400).send("You are not in Record or aleady left the Record"); // Handle if user is already in the players array
//       }


//       const updatedRecord = await RecordModel.findByIdAndUpdate(
//         id,
//         { $pull: { players: user._id } },
//         { new: true }
//       );
  
//       if (!updatedRecord) {
//         return next(
//           CustomError.createError("You are not authorized to Leave this Event")
//         );
//       }
  
//       return next(
//         CustomSuccess.createSuccess(
//           updatedRecord,
//           "Left Record Successfully",
//           200
//         )
//       );
//     } catch (err) {
//       console.error(err);
//       return next(
//         CustomError.createError("you are not authorized to perform this action"),
//         500
//       );
//     }
//   };

//   const getUserRecord = async (req, res, next) => {
//     const { user } = req;
//     const targetUserId = user._id //typeof req.body.uid === "string" ? req.body.uid : null;
  
//     if (!targetUserId) {
//       return res.status(400).send("Invalid user ID.");
//     }
  
//     try {
//       const GetRecord = await RecordModel.find({
//         players: { $in: [targetUserId] }
//       })
  
//       return next(
//         CustomSuccess.createSuccess(GetRecord, "Records Retrieved Successfully", 200)
//       );
//     }
    
    
//     catch {
//       return next(CustomError.createError("Can't get Events"), 500);
  
//       //res.status(500).send(err);
//     }
//   };
  

//export default router;

const RecordController = {
    createRecord
};

export default RecordController;
