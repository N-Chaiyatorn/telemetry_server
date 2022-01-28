/**
 *  Sink interface which take source object and pipeline telemetry to the sink target
 *  These classes will be used to retrieve telemetry and stream to sink class's object
 *  Currently, there are 3 types of interface which is SocketClient, SocketServer and SerialPort
 *
 * @param { Object } sourceConfigs - Config file for target source, contains name, type, port, ip, pollInterval, successFunction
 *
 * @author Chaiyatorn Niamrat chaiyatorn.n@muspacecorp.com
 */

const net = require("net");
const SerialPortDriver = require("serialport");
const Roslib = require("roslib");
const EventEmitter = require("events");
const Three = require("three");
//const Ros2d = require("../rosDep/ros2d.js");

class SocketClient {
  constructor(sourceConfigs) {
    this.connectionName = sourceConfigs.name;
    this.type = sourceConfigs.type;

    this.ip = sourceConfigs.ip;
    this.port = sourceConfigs.port;
    this.pollInterval = sourceConfigs.pollInterval || 10;
    this.successFunction = sourceConfigs.successFunction;

    this.interface = new EventEmitter();

    this.setupConnections();
  }

  setupConnections() {
    this.connect().catch((reject) => {
      this.printRejectNotice(reject);
      this.handleConnectionError(reject);
    });
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to reconnect to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  handleConnectionError() {
    setTimeout(() => {
      this.connect().catch((reject) => {
        this.handleConnectionError(reject);
      });
    }, this.pollInterval * 1000);
  }

  connect() {
    if (!this.socket) {
      this.socket = new net.Socket();
    }
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.ip, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        if (this.successFunction) this.successFunction(this.socket);
        resolve(true);
      });

      this.socket.on("data", (data) => {
        this.interface.emit("received", data);
      });

      this.socket.on("end", () => {
        console.log("Client disconnected");
      });

      this.socket.on("error", (err) => {
        this.socket.removeAllListeners("error");
        this.socket.removeAllListeners("data");
        this.socket.removeAllListeners("end");
        this.socket.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class SocketServer extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to re-listen to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  connect() {
    if (!this.server) {
      this.server = net.createServer((socket) => {
        console.log("Client socket connected to socker server");
        socket.on("data", (data) => {
          this.interface.emit("received", data);
        });

        socket.on("end", () => {
          console.log("Client Disconnected");
        });
      });
    }
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(
          `${this.connectionName} ${this.type}: Listening on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log("Address in use, retrying...");
          server.close();
        }
        reject(err.message);
      });
    });
  }
}

class SerialPort extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  connect() {
    if (!this.serialPort) {
      this.serialPort = new SerialPortDriver(`/dev/${this.port}`, {
        buadRate: 115200,
        autoOpen: false,
        lock: false,
      });
    }
    return new Promise((resolve, reject) => {
      this.serialPort.open(() => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.port}`
        );
        resolve(true);
      });
      this.serialPort.on("data", (data) => {
        this.interface.emit("received", data);
      });
      this.serialPort.on("error", (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.serialPort.removeAllListeners("error");
        this.serialPort.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class RosInterface extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
    this.topics = sourceConfigs.topics;
    this.waypoints = sourceConfigs.waypoints;

    this.connectionState = false;

    this.robotState = {
      x: 0,
      y: 0,
      orientation: 0,
      linear_vel: 0,
      angular_vel: 0,
      battery: 50,
      time_remain: 13,
    };
  }

  /*
  view_map() {
    const viewer = new Ros2d.Viewer({
      divID: "nav_div",
      width: 450,
      height: 657,
    });
    const navClient = new Nav2d.OccupancyGridClientNav({
      ros: this.ros,
      rootObject: viewer.scene,
      viewer: viewer,
      severName: "/move_base",
      withOrientation: true,
    });
  }
  */
  getState(state) {
    return this.robotState[state]
  }

  joystickCmd(linear, angular) {
    const cmd_vel = new Roslib.Topic({
      ros: this.ros,
      name: this.topics.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/Twist",
    });

    const twist = new Roslib.Message({
      linear: {
        x: linear / 100,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: angular / 100,
      },
    });

    cmd_vel.publish(twist);
  }

  waypointCmd(desiredPlace, waypoint) {
    const actionClient = new Roslib.ActionClient({
      ros: this.ros,
      serverName: "/move_base",
      actionName: "move_base_msgs/MoveBaseAction",
    });
    const positionVec3 = new Roslib.Vector3(null);

    const orientation = new Roslib.Quaternion(null);


    const place = this.waypoints[desiredPlace];
    positionVec3.x = place[waypoint].position.x;
    positionVec3.y = place[waypoint].position.y;
    positionVec3.z = place[waypoint].position.z;

    //orientation
    orientation.x = place[waypoint].orientation.x;
    orientation.y = place[waypoint].orientation.y;
    orientation.z = place[waypoint].orientation.z;
    orientation.w = place[waypoint].orientation.w;

    //Create package POSE
    const pose = new Roslib.Pose({
      position: positionVec3,
      orientation: orientation,
    });

    const goal = new Roslib.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: pose,
        },
      },
    });

    goal.send();
  }

  updateRobotState() {
    const pose_subscriber = new Roslib.Topic({
      ros: this.ros,
      name: this.topics.POSE_TOPIC,
      messageType: "geometry_msgs/PoseWithCovarianceStamped",
    });

    pose_subscriber.subscribe((message) => {
      this.robotState.x = message.pose.pose.position.x.toFixed(2);
      this.robotState.y = message.pose.pose.position.y.toFixed(2);
      this.robotState.orientation = this.getOrientationFromQuaternion(
        message.pose.pose.orientation
      ).toFixed(2);
    });

    const velocity_subscriber = new Roslib.Topic({
      ros: this.ros,
      name: this.topics.ODOM_TOPIC,
      messageType: "nav_msgs/Odometry",
    });

    velocity_subscriber.subscribe((message) => {
      this.robotState.linear_vel = message.twist.twist.linear.x.toFixed(2);
      this.robotState.angular_vel = message.twist.twist.angular.z.toFixed(2);
    });
  }

  getOrientationFromQuaternion(ros_orientation_quaternion) {
    const q = new Three.Quaternion(
      ros_orientation_quaternion.x,
      ros_orientation_quaternion.y,
      ros_orientation_quaternion.z,
      ros_orientation_quaternion.w
    );
    const RPY = new Three.Euler().setFromQuaternion(q);
    return RPY["_z"] * (180 / Math.PI);
  }

  connect() {
    if (!this.ros) {
      this.ros = new Roslib.Ros();

      this.ros.on("connection", () => {
        this.connectionState = true
        this.updateRobotState()
        console.log("Connected to ROS");
      });

      this.ros.on("close", () => {
        this.connectionState = false
        console.log("Connection is closing");
      });
    }

    return new Promise((resolve, reject) => {
      this.ros.connect("ws://" + this.ip + ":" + this.port, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        if (this.successFunction) this.successFunction(this.ros);
        resolve(true);
      });

      this.ros.on("error", (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.connectionState = false
        this.ros.removeAllListeners("error");
        this.ros.removeAllListeners("connection");
        this.ros.removeAllListeners("close");
        reject(err.message);
      });
    });
  }
}

module.exports = {
  SocketClient: SocketClient,
  SocketServer: SocketServer,
  SerialPort: SerialPort,
  Ros: RosInterface,
};
