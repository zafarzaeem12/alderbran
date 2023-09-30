import { Router, application } from "express";
import CaseController from "../Controller/CaseController.js";



import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let CaseRouters = Router();

// AuthRouters.route("/register").post(AuthController.registerUser);


CaseRouters.route("/getallnon_value").get(CaseController.getallNonvalueActivity);


application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(CaseRouters);
  this.use(path, middleware, CaseRouters);
  return CaseRouters;
};
CaseRouters.prefix("/user", AuthMiddleware, async function () {  
  
  CaseRouters.route("/form_create").post(CaseController.createForms);
  CaseRouters.route("/getforms").get(CaseController.getallForms);
  CaseRouters.route("/non_value_create").post(CaseController.addNonValueActivity);
  CaseRouters.route("/create_doc").post(CaseController.createUploaddocuments);
  CaseRouters.route("/create_rec").post(CaseController.uploadRecording);
  CaseRouters.route("/getupload").get(CaseController.getallUserUploads);
  CaseRouters.route("/create_impact").post(CaseController.createImpactibility);
  CaseRouters.route("/create_case_activity").post(CaseController.createCaseActivity);
  CaseRouters.route("/create_case").post(CaseController.createCase);
  CaseRouters.route("/get_summary").get(CaseController.getSummary);
  CaseRouters.route("/get_summary/:id").get(CaseController.getOneSummary);
});
