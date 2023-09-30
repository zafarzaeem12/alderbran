import { Router,application } from "express";
import { AdminMiddleware } from "./Middleware/AuthMiddleware.js";
import AdminController from "../Controller/AdminController.js";
import ContentTextController from "../Controller/ContentController.js";
import AuthController from "../Controller/AuthController.js";
import UserController from "../Controller/UserController.js";




export let AdminRouters = Router();


application.prefix = Router.prefix = function (path, middleware, configure) {
    configure(AdminRouters);
    this.use(path, middleware, AdminRouters);
    return AdminRouters;
  };
  
  //const contentController = require("../controllers/contentController");

  //router.post("/", contentController.upload.single("file"), contentController.createContent);

    
  AdminRouters.prefix("/admin", AdminMiddleware, () => {
      // User api start here
      AdminRouters.route("/createUser").post(AdminController.createUser);
      AdminRouters.route("/getallusers").get(AdminController.getAllUsers);
      AdminRouters.route("/deleteuser/:id").patch(AdminController.deleteUser);
      AdminRouters.route("/sendNotification").post(AdminController.SendNotification);
      // User api end here

      // Organization api start here
    //   AdminRouters.route('/addorganization').post(AdminController.createOrganization);
    //   AdminRouters.route('/getorganization/:id').get(AdminController.getOneOrganization);
    //   AdminRouters.route('/getallorganization').get(AdminController.getallOrganization);
    //   AdminRouters.route('/deleteorganization/:id').delete(AdminController.DeleteOrganization);
      // Organization api end here

     // Industry api start here
          AdminRouters.route('/addindustry').post(AdminController.createIndustry);
          AdminRouters.route('/getindustry/:id').get(AdminController.getOneIndustry);
          AdminRouters.route('/getallindustry').get(AdminController.getallIndustry);
          AdminRouters.route('/deleteindustry/:id').delete(AdminController.DeleteIndustry);
          AdminRouters.route('/assignindustry/:id').put(AdminController.AssignedIndustryToUser);
    // Industry api end here

    // Role api start here
        AdminRouters.route('/addrole').post(AdminController.createRole);
        AdminRouters.route('/getrole/:id').get(AdminController.getOneRoles);
        AdminRouters.route('/getallrole').get(AdminController.getallRoles);
        AdminRouters.route('/deleterole/:id').delete(AdminController.DeleteRoles);
     // Role api end here
    
    // Activity api start here
        AdminRouters.route('/addactivity').post(AdminController.createActivity);
        AdminRouters.route('/getallactivity').get(AdminController.getallactivities);
        AdminRouters.route('/deleteactivity/:id').delete(AdminController.DeleteActivity);
        AdminRouters.route('/getactivity/:id').get(AdminController.getOneactivitiy);
    // Activity api end here
    
    

  //About Routes

  AdminRouters.route("/about")
    .post(ContentTextController.createDocument)
    .get(ContentTextController.getDocument);
    AdminRouters.route("/about/:id")
    .get(ContentTextController.getSingleDocument)
    .patch(ContentTextController.updateDocument)
    .delete(ContentTextController.deleteDocument);

  //Terms Routes

  AdminRouters.route("/terms")
    .post(ContentTextController.createDocument)
    .get(ContentTextController.getDocument);
  AdminRouters.route("/terms/:id")
    .get(ContentTextController.getSingleDocument)
    .patch(ContentTextController.updateDocument)
    .delete(ContentTextController.deleteDocument);

  //Privacy Routes

  AdminRouters.route("/privacy")
    .post(ContentTextController.createDocument)
    .get(ContentTextController.getDocument);
  AdminRouters.route("/privacy/:id")
    .get(ContentTextController.getSingleDocument)
    .patch(ContentTextController.updateDocument)
    .delete(ContentTextController.deleteDocument);
});
//   AdminRouters.route("/industry").get(AdminController.getAllIndustries);

  AdminRouters.route("/privacy")
.get(ContentTextController.getDocument);

AdminRouters.route("/terms")
    .get(ContentTextController.getDocument);

    AdminRouters.route("/about")
    .get(ContentTextController.getDocument);
  


