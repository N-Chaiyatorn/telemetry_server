/**
 * RESTful API for ROS communication
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const express = require("express");

function rosServer(RosInterface) {
  const router = express.Router();

  // allow requesting code from any origin to access the resource
  router.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });

  // handle telemetry requests
  router.get("/state", function (req, res) {
    const topic = req.query.topic;
    res.send(RosInterface.getState(topic).toString()).end();
  });
  
  router.get("/waypointCmd", function (req, res) {
    console.log("received request")
    const place = req.query.place.toLowerCase();
    const waypoint = req.query.waypoint.toLowerCase();
    res.set("Content-Type", "text/html");
    try {
      RosInterface.waypointCmd(place, waypoint)
      res.send(`Your waypoint command to ${place}:${waypoint} is successfully dispatched!`).end();

    } catch {
      res.send(`Error on dispatching the waypoint command to ${place}:${waypoint}`).end();
    }
  });

  router.post("/joystickCmd", function (req, res) {
    const linear = parseInt(req.query.linear);
    const angular = parseInt(req.query.angular);
    res.set("Content-Type", "text/html");

    try {
      RosInterface.joystickCmd(linear, angular)
      res.send(`Your joystick command is successfully dispatched!`).end();

    } catch {
      res.send(`Error on dispatching the joystick command`).end();
    }
  });

  return router;
}

module.exports = rosServer;
