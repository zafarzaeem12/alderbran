import * as jose from "jose";
import jwt from 'jsonwebtoken';
// import authModel from "../DB/Model/authModel";
export const generateToken = (payload) => {
  const token = jose.JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

export const verifyToken = (token) => {
  const decoded = jose.JWT.verify(token, process.env.JWT_SECRET);
  return decoded;
};

export const generateJWTToken = (payload) => {
  console.log("=====%%%%=====>",payload)
  try{
    if(payload.email && payload.password){
      const token = jwt.sign(
        {
          name : payload.name,
          email: payload.email,
          password : payload.password,
          otpKey : payload.otpKey,
          deviceToken : payload.deviceToken
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token
    }else if(payload.subject && payload.isForget) {
      const token = jwt.sign(
        {
          email: payload.email,
          otpKey : payload.otpKey,
          deviceToken : payload.deviceToken,
          subject : payload.subject,
          isForget : payload.isForget
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token
    }
    else if(payload.otpKey && payload.auth && payload.email){
      const token = jwt.sign(
        {
          email: payload.email,
          otpKey : payload.otpKey,
          auth : payload.auth
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token
    }else if(payload.id){
     
      const token = jwt.sign(
        {
          id: payload.id
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return token
    }
  }catch(err){
  console.log(err)
  }
  }
  
  export const verifyJWTToken = async (req,res,next) => {
    try{
      
      const token = req.headers['authorization'].split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      if(!decoded){
        return res.status(401).send({ status: 0, message: 'Unauthorized' });
      }
    else{
      req.data = decoded
       next()
    }
    }catch(err){  
      res.status(500).send({ message : "No User found"})
    }
  }
