import { Router, application } from "express";
import { AdminMiddleware } from "./Middleware/AuthMiddleware.js";
//import EventController from "../Controller/EventsController.js";
import UploadFilter from "../Utils/filefilter.js";
import RecordController from "../Controller/RecordController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let RecordRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(RecordRouters);
  this.use(path, middleware, RecordRouters);
  return RecordRouters;
};

RecordRouters.prefix("/user", AuthMiddleware, async function () {  
    RecordRouters.route("/createRecord").post(RecordController.createRecord);
    
  })
// EventRouters.route("/joinevent/:id").patch(EventController.joinEvent);
// EventRouters.route("/leftevent/:id").patch(EventController.removeUserEvent);
// EventRouters.route("/geteventsbyuser").post(EventController.getAllEventsbyUser);

//EventRouters.route("/getallevents").get(EventController.getEvent);

//EventRouters.prefix("/admin", AdminMiddleware, () => {
  //Events Routes
  //EventRouters.route("/events").get(EventController.getAdminEvent);

//   EventRouters.route("/event")
//     .post(UploadFilter.uploadEvents.single("file"), EventController.createEvent)

    // .get(EventController.getEvent);
//   EventRouters.route("/event/:id")
//     .get(EventController.getSingleEvent)
//     .patch(
//       UploadFilter.uploadEvents.single("file"),
//       EventController.updateEvent
//     )
//     .delete(EventController.deleteEvent);

//  EventRouters.route("/removeuser/:id").patch(EventController.removeUserEvent);
//});
