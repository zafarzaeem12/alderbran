import authModel from "../DB/Model/authModel.js";
import organizationModel from "../DB/Model/organizationModel.js";
import IndustryModel from "../DB/Model/industryModel.js";
import RoleModel from '../DB/Model/roleModel.js';
import ActivityModel from '../DB/Model/activityModel.js';
import {verifyJWTToken} from '../Utils/jwt.js'
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";

import {
  IdValidator,
  RegisterUserValidator,
} from "../Utils/Validator/UserValidator.js";
import {
  designationValidator,
  notificationValidator,
} from "../Utils/Validator/adminvalidator.js";

import push_notifications from "../Config/push_notification.js";

// const adminregister = async () => {
//   const AuthModel = new authModel();
//   AuthModel.email = "admin@admin.com";
//   AuthModel.password = hashPassword("123456");
//   AuthModel.userType = "admin";
//   AuthModel.name = "admin";
//   await AuthModel.save()
// };
// adminregister();

const createUser = async (req, res , next) => {
  try {
    const {  email } = req.body;
    const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const findUser = await authModel.findOne({ email });
    if (!email) {
      return next(CustomError.notFound("Email is required"));
    }
    else if (!email.match(emailValidation)) {
      return next(CustomError.badRequest("Email is in Valid"));
    }else if (findUser) {
      return res.status(400).json({
        status: 0,
        message: "User with the same email already exists",
      });
    }else {
      const Data = {
        email
      }
      const User = await authModel.create(Data)
      return res.status(201).json({
        status: 1,
        message: "User created successfully",
        data: User,
      });
    }

  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: 0, message: error.message });
  }
};

// const createIndustry = async (req, res) => {
//   try {
//     const { title } = req.body;

//     const existingIndustry = await IndustryModel.findOne({ title });

//     if (existingIndustry) {
//       return res.status(400).json({
//         status: 0,
//         message: "Industry with the same title already exists",
//       });
//     }

//     const Industry = new IndustryModel({ title });

//     await Industry.save();

//     return res.status(201).json({
//       status: 1,
//       message: "Industry created successfully",
//       data: Industry,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: 0, message: error.message });
//   }
// };

// const getAllIndustries = async (req, res) => {
//   try {
//     const Industries = await IndustryModel.find();

//     return res.status(200).json({
//       status: 1,
//       message: "Industries retrieved successfully",
//       data: Industries,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: 0, message: error.message });
//   }
// };


// const createOrganization = async (req, res, next) => {
//   try {

//     const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    
//     if(!checkedAdmin){
//       return res.send(404).send({ message : 'You are not admin'})
//     }else{
//       const { title, status , assignedUser } = req.body;
//       const checkedOrganization = await organizationModel.findOne({title})
//       if(checkedOrganization){
//         return res.status(404).send({ 
//           message : "this Organization already exists",
//           status: 0
//          })
//       }
  
//       const Data = {
//         title,
//         status,
//         assignedUser
//       };
//       const newOrganization = await organizationModel.create(Data);
//       return res.status(201).send({
//         message: "New Organization created successfully",
//         status: 1,
//         data: newOrganization,
//       });
//     }


//   } catch (err) {
//     res.status(500).send({
//       message : "Not found",
//       status : 0
//     })
//   }
// };


const createIndustry = async (req,res,next) => {
try{
  const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
  const { title , status , Organization_id } = req.body

  const checkedIndustry = await IndustryModel.findOne({ title});
  if(checkedIndustry){
    return res.status(404).send({ 
      message : "this Industry already exists",
      status:0
    })
  }
  const Data = {
    title,
    status,
    Organization_id
  }
  const newIndustry = await IndustryModel.create(Data)

 return res.status(201).send({
    message : "New Industry created successfully",
    status:1,
    data : newIndustry
  })
    }
}catch(err){
  res.status(500).send({
    message : "Internal error",
    status:0
    
  })
}
}

const createRole = async (req,res,next) => {
try{
  const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
  const {title , status , Industry_id  } = req.body

  const checkedRole = await RoleModel.findOne({ title})
  if(checkedRole){
    return res.status(404).send({ 
      message : "this role already exist" , 
      status:0
    })
  }

  const Data = {
    title,
    status,
    Industry_id
  }

  const createRoles = await RoleModel.create(Data)
  return res.status(201).send({
    message : "Roles created Successfully",
    status : 1,
    data : createRoles
  })
}
}catch(err){
  res.status(500).send({
    message : "Internal error",
    status : 0
  })
}
}

const createActivity = async (req,res,next) => {
  try{
    const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
    const { title , status , roles_id} = req.body

    const checked  = await ActivityModel.findOne({title})
    if(checked){
      return res.status(404).send({
        message : "this activity already exists",
        status :0
      })
    }

    const Data = {
      title,
      status,
      roles_id
    }
    const createActivity = await ActivityModel.create(Data)
    return res.status(201).send({
      message : "Activity created successfully",
      status : 1,
      data : createActivity
    })
  }
  }catch(err){
    res.status(500).send({
      message : "Internal error",
      status : 0
    })
  }
}

// const getallOrganization = async (req,res,next) => {
//   const limit  = Number(req.query.limit) || 10
//   const page = Number(req.query.page) || 1
//   const skip = (page - 1) * limit
// try{
//   const getall = await organizationModel.find().populate({path : 'assignedUser' , select: 'name'}).limit(limit).skip(skip)
//   const allOrganization = await organizationModel.countDocuments();
//   const totalPages = Math.ceil(allOrganization / limit);

//   req.query.limit ?? req.query.page ? 
//   res.status(200).send({
//     total : getall.length,
//     currentpage : page,
//     totalPages: totalPages,
//     message : "Fetch all Organization",
//     status : 1,
//     data : getall
//   }) : 
//   res.status(200).send({
//     total : getall.length,
//     message : "Fetch all Organization",
//     status : 1,
//     data : getall
//   }) 

// }catch(err){
//   res.status(500).send({
//     message : "Not Fetching Record",
//     status : 0
//   })
// }
// }


const getallIndustry  = async (req,res,next) => {
  const limit  = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const skip = (page - 1) * limit
try{
  const getIndustries = await IndustryModel.find().populate('Organization_id').limit(limit).skip(skip)
  const allIndustries = await IndustryModel.countDocuments();
  const totalPages = Math.ceil(allIndustries / limit);

  req.query.limit ?? req.query.page ? 
  res.status(200).send({
    total : allIndustries,
    currentpage : page,
    totalPages: totalPages,
    message : "Fetch all Industries",
    status : 1,
    data : getIndustries
  }) : 
  res.status(200).send({
    total : getIndustries.length,
    message : "Fetch all Industries",
    status : 1,
    data : getIndustries
  }) 
}catch(err){
  res.status(500).send({
    message : "Internal error",
    status : 0
  })
}
}

const getallRoles = async (req,res,next) => {
  const limit  = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const skip = (page - 1) * limit
try{
  const allRoles = await RoleModel.find().populate({path :'Industry_id' ,select:"title" }).limit(limit).skip(skip)
  const allRolesfound = await RoleModel.countDocuments();
  const totalPages = Math.ceil(allRolesfound / limit);
  req.query.limit ?? req.query.page ? 
  res.status(200).send({
    total : allRoles.length,
    currentpage : page,
    totalPages: totalPages,
    message : "Fetch all Roles",
    status : 1,
    data : allRoles
  }) : 
  res.status(200).send({
    total : allRoles.length,
    message : "Fetch all Roles",
    status : 1,
    data : allRoles
  }) 
}catch(err){
  res.status(500).send({
    message : "Internal error",
    status:0
  })
}
}

const getallactivities = async (req,res,next) => {
  const limit  = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const skip = (page - 1) * limit
try{
  const allactivity = await ActivityModel.find().populate('roles_id').limit(limit).skip(skip)
  const allactivityfound = await RoleModel.countDocuments();
  const totalPages = Math.ceil(allactivityfound / limit);
  req.query.limit ?? req.query.page ? 
  res.status(200).send({
    total : allactivity.length,
    currentpage : page,
    totalPages: totalPages,
    message : "Fetch all Activity",
    status : 1,
    data : allactivity
  }) : 
  res.status(200).send({
    total : allactivity.length,
    message : "Fetch all Activity",
    status : 1,
    data : allactivity
  }) 

}catch(err){
  return res.status(500).json({ status: 0, message: error.message });
}
}

// const getOneOrganization = async (req,res,next) => {
// const id = req.params.id
// try{
//  const getbyId =  await organizationModel.findOne({ _id : id})
//  res.status(200).send({
//   message : "Record Fetched Successfully",
//   status : 1,
//   data : getbyId
//  })
// }catch(err){
//   res.status(200).send({
//     message : "Record not Fetched Successfully",
//     status : 0
//   })
// }
// }

const AssignedIndustryToUser = async (req,res,next) => {
  const industryId = req.params.id;
  const userId = req.body.id;
try{
  const user_assigned_industry = await authModel.findByIdAndUpdate(
    {_id : userId},
    { $set : { assignIndustry : industryId } },
    {new : true}
    ).populate({ path :'assignIndustry' , select : "title"}).select("-password")
    res.status(201).send({ message : "Industry Assigned to user" , status : 1 , data : user_assigned_industry})
}catch(err){
  res.status(500).send({ message : 'Industry not assigned' , status : 0})
}
}

const getOneIndustry = async (req,res,next) => {
  const id = req.params.id
try{
  const getbyId =  await IndustryModel.findOne({ _id : id}) 
  res.status(200).send({
    message : "Record Fetched Successfully",
    status : 1,
    data : getbyId
   })
}catch(err){
  res.status(200).send({
    message : "Record not Fetched Successfully",
    status : 0
   })
}
}
const getOneRoles = async (req,res,next) => {
  const id = req.params.id
try{
  const getbyId =  await RoleModel.findOne({ _id : id}) 
  res.status(200).send({
    message : "Record Fetched Successfully",
    status : 1,
    data : getbyId
   })
}catch(err){
  res.status(200).send({
    message : "Record not Fetched Successfully",
    status : 0
   })
}
}
const getOneactivitiy = async (req,res,next) => {
  const id = req.params.id
try{
  const getbyId =  await ActivityModel.findOne({ _id : id}) 
  res.status(200).send({
    message : "Record Fetched Successfully",
    status : 1,
    data : getbyId
   })
}catch(err){
  res.status(200).send({
    message : "Record not Fetched Successfully",
    status : 0
   })
}
}

// const DeleteOrganization = async(req,res,next) => {
//   const id = req.params.id;
//   try{
//     const checkDatainDB = await organizationModel.findOne({ _id : id})
//       if(!checkDatainDB){
//         return res.status(404).send({ message :"Data not found" })
//       }
//     const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
//     if(!checkedAdmin){
//       return res.send(404).send({ message : 'You are not admin'})
//     }
//       await organizationModel.deleteOne({_id : id})
//     res.status(200).send({
//       message:"Record Deleted Successfully",
//       status : 1
//     })
  
//   }catch(err){
//     res.status(500).send({
//       message :"Record not Deleted",
//       status : 0
//     })
//   }
// }


const DeleteIndustry = async(req,res,next) => {
  const id = req.params.id;
  try{
    const checkDatainDB = await IndustryModel.findOne({ _id : id})
      if(!checkDatainDB){
        return res.status(404).send({ message :"Data not found" })
      }
      
    const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
    const deletebyId = await IndustryModel.deleteOne({_id : id})
    res.status(200).send({
      message:"Record Deleted Successfully",
      status : 1
    })
  }
  }catch(err){
    res.status(500).send({
      message :"Record not Deleted",
      status : 0
    })
  }
}
const DeleteRoles = async(req,res,next) => {
  const id = req.params.id;
  try{
    const checkDatainDB = await RoleModel.findOne({ _id : id})
    if(!checkDatainDB){
      return res.status(404).send({ message :"Data not found" })
    }

    const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
    const deletebyId = await RoleModel.deleteOne({_id : id})
    res.status(200).send({
      message:"Record Deleted Successfully",
      status : 1
    })
  }
  }catch(err){
    res.status(500).send({
      message :"Record not Deleted",
      status : 0
    })
  }
}
const DeleteActivity = async(req,res,next) => {
  const id = req.params.id;
  try{
    const checkDatainDB = await ActivityModel.findOne({ _id : id})
    if(!checkDatainDB){
      return res.status(404).send({ message :"Data not found" })
    }
    const checkedAdmin = await authModel.findOne( { $and : [{_id : req.data.id} , { userType : "admin"}] })
    if(!checkedAdmin){
      return res.send(404).send({ message : 'You are not admin'})
    }else{
    const deletebyId = await ActivityModel.deleteOne({_id : id})
    res.status(200).send({
      message:"Record Deleted Successfully",
      status : 1
    })
  }
  }catch(err){
    res.status(500).send({
      message :"Record not Deleted",
      status : 0
    })
  }
}

const SendNotification = async (req, res, next) => {
  try {
    const { error } = notificationValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { userId, allUser, title, body } = req.body;
    var data = [];
    if (allUser) {
      data = [...(await authModel.find({}).populate("devices"))];
    } else {
      data = [
        ...(await authModel.find({ _id: { $in: userId } }).populate("devices")),
      ];
    }
    console.log(data);
    data.map((item) => {
      item.devices.map(async (item2) => {
        await push_notifications({
          deviceToken: item2.deviceToken,
          title,
          body,
        });
      });
    });
    return next(
      CustomSuccess.createSuccess({}, "Notification Sent successfully", 200)
    );
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update the fields: isDeleted = true, notificationOn = false
    const updatedUser = await authModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        notificationOn: false,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      message : "User Soft Deleted Successfuly",
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    // Handle the error
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: err.message,
    });
  }
};

const getAllUsers = async (req, res, next) => {
    const limit  = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const skip = (page - 1) * limit
  try {
    // Retrieve all users excluding the password field
    const allusers = await authModel
      .find({ userType :  "user" })
      .select("-password")
      .populate("image")
      .limit(limit).skip(skip)
      
      const allIUserfound = await authModel.countDocuments();
      const totalPages = Math.ceil(allIUserfound / limit);

  req.query.limit ?? req.query.page ? 
  res.status(200).send({
    total : allIUserfound,
    currentpage : page,
    totalPages: totalPages,
    message : "Fetch all Users",
    status : 1,
    data : allusers
  }) : 
  res.status(200).send({
    total : allusers.length,
    message : "Fetch all Users",
    status : 1,
    data : allusers
  }) 
  } catch (error) {
    return res.status(400).json({ status: 0, message: error.message });
  }
};

const AdminController = {
  getAllUsers,
  deleteUser,
  SendNotification,
  createUser ,
//   createOrganization : [verifyJWTToken , createOrganization],
  createIndustry : [verifyJWTToken , createIndustry],
  createRole : [verifyJWTToken , createRole],
  createActivity : [verifyJWTToken , createActivity],
  AssignedIndustryToUser : [ verifyJWTToken , AssignedIndustryToUser ],
//   getallOrganization,
  getallIndustry,
  getallRoles,
  getallactivities,
//   getOneOrganization ,
  getOneIndustry ,
  getOneRoles,
  getOneactivitiy,
//   DeleteOrganization : [verifyJWTToken , DeleteOrganization],
  DeleteIndustry : [verifyJWTToken , DeleteIndustry],
  DeleteRoles : [verifyJWTToken , DeleteRoles],
  DeleteActivity : [verifyJWTToken , DeleteActivity],
};

export default AdminController;
