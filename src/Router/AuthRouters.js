import { Router, application } from "express";
import AuthController from "../Controller/AuthController.js";


import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let AuthRouters = Router();

// AuthRouters.route("/register").post(AuthController.registerUser);


AuthRouters.route("/login").post(AuthController.LoginUser);
AuthRouters.route("/adminlogin").post(AuthController.AdminLogin);
AuthRouters.route("/forgetpassword").post(AuthController.forgetPassword);
AuthRouters.route("/sociallogin").post(AuthController.SocialLoginUser);

AuthRouters.route("/completeprofile").post(AuthController.completeProfile);
AuthRouters.route("/verifyprofile").post(AuthController.verifyProfile);

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(AuthRouters);
  this.use(path, middleware, AuthRouters);
  return AuthRouters;
};

AuthRouters.prefix("/user", AuthMiddleware, async function () {  
  AuthRouters.route("/update").put(AuthController.updateUser);    
  AuthRouters.route("/getprofile").get(AuthController.getProfile);     
  AuthRouters.route("/resetpassword").post(AuthController.resetpassword);     
  AuthRouters.route("/Verify").post(AuthController.VerifyOtp);
  AuthRouters.route("/logout").post(AuthController.Logout);


  


});
