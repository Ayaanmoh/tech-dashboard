import React, { useEffect, useState } from "react";
import Axios from "axios";
import { apiUsername, apiPassword } from "../../utils/api_secret";
import { Link } from "react-router-dom";
import {
  Grid,
  Typography,
  List,
  ListItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { CheckBox, ArrowBackIosOutlined } from "@material-ui/icons";
// import WaterSensorByGatewaySidebar from "./WaterSensorByGatewaySidebar";
import NodeSensorVisual from "./WaterSensorVisuals/NodeSensorVisual";
import GatewayVisual from "./WaterSensorVisuals/GatewayVisual";
import WaterSensorByGatewayTopbar from "./WaterSensorByGatewayTopbar";

const useStyles = makeStyles((theme) => ({
  gridList: {
    width: "100%",
    height: 300,
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
  },
  titleBar: {
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  icon: {
    color: "white",
  },
}));

const getNodeSerialNo = async (gatewayNo) => {
  return await Axios({
    method: "get",
    url: `https://techdashboard.tk/api/retrieve/nodes/by/gateway/${gatewayNo}`,
    auth: {
      username: apiUsername,
      password: apiPassword,
    },
  });
};

const WaterSensorByGateway = (props) => {
  console.log(props);
  const classes = useStyles();
  const gatewayNo =
    props.location.state.gatewaysno || props.match.params.gatewayId;

  const [bareNodeSerialNo, setBareNodeSerialNo] = useState([
    props.location.state.bareNodeSerialNo || "",
  ]);
  const [coverNodeSerialNo, setCoverNodeSerialNo] = useState([
    props.location.state.bareNodeSerialNo || "",
  ]);
  const [loading, setLoading] = useState(false);
  const [activeChip, setActiveChip] = useState("");

  const [bareNodeObject, setBareNodeObject] = useState({});
  const [coverNodeObject, setCoverNodeObject] = useState({});
  //   get all nodes in the gateway, and get all sensors in each node
  //    this can be done by making a nested object here
  /* eg. gatewayNo: {
    nodeNumber: {
        sensorDataObject: {},
        nodeInfo:{}
    },
    nodeNumber:{}
}

*/

  // first lets get node serial number

  const setNodeArrays = (nodeData, resolve, reject) => {
    let bareNodeArray = [];
    let coverNodeArray = [];
    let bareNodeObject = {};
    let coverNodeObject = {};

    let innerPromise = new Promise(async (resolve, reject) => {
      for (let node in nodeData) {
        //   let i = 0;
        //   console.log(node);
        if (nodeData[node]["bare_node_serial_no"] !== null)
          bareNodeArray.push(nodeData[node]["bare_node_serial_no"]);
        if (nodeData[node]["cover_node_serial_no"] !== null)
          coverNodeArray.push(nodeData[node]["cover_node_serial_no"]);
        //   i++;
      }
      setBareNodeSerialNo(bareNodeArray);
      setCoverNodeSerialNo(coverNodeArray);

      for (let nodeSerialNo in bareNodeArray) {
        bareNodeObject[bareNodeArray[nodeSerialNo]] = false;
      }
      setBareNodeObject(bareNodeObject);
      for (let nodeSerialNo in coverNodeArray) {
        coverNodeObject[coverNodeArray[nodeSerialNo]] = false;
      }
      setCoverNodeObject(coverNodeObject);
      // setBareNodeSerialNo(bareNodeArray);
      if (bareNodeArray.length > 0) resolve(bareNodeArray[0]);
      else if (coverNodeArray.length > 0) resolve(coverNodeArray[0]);
      else resolve(null);
    });

    innerPromise.then((val) => {
      //   set active chip to first bare/cover node serial number
      console.log("bareNodeSerialNo.length", val);
      resolve(setActiveChip(val));
    });
  };
  useEffect(() => {
    setLoading(true);
    let nodeSerialNosPromise = getNodeSerialNo(gatewayNo);

    nodeSerialNosPromise
      .then((nodesObject) => {
        if (nodesObject.data.status === "success") {
          let nodeData = nodesObject.data.data;
          let promise = new Promise((resolve, reject) => {
            setNodeArrays(nodeData, resolve, reject);
            setLoading(false);
            // return promise;
          });

          promise.then(() => {
            // console.log('Promise resolved');
          });
        }
      })
      .then(() => {
        // console.log(coverNodeObject);
      });
  }, []);

  return !loading ? (
    <div>
      <GridList spacing={1} className={classes.gridList}>
        <GridListTile
          key={gatewayNo}
          style={{ width: "100%", height: "300px" }}
        >
          <Grid container>
            {/* <Grid item sm={12}>
              <Typography variant="h5">
                Gateway Serial Number {gatewayNo}
              </Typography>
            </Grid> */}
            <Grid item sm={12}>
              <GatewayVisual gatewayNo={gatewayNo} />
            </Grid>
          </Grid>
          <GridListTileBar
            title={gatewayNo}
            style={{
              zIndex: "999",
            }}
            titlePosition="top"
            actionIcon={
              <Link to="/water-sensors">
                <IconButton
                  aria-label={`Back`}
                  tooltip="Back"
                  className={classes.icon}
                  to="/water-sensors"
                >
                  <ArrowBackIosOutlined />
                </IconButton>
              </Link>
            }
            actionPosition="left"
            className={classes.titleBar}
          />
        </GridListTile>
      </GridList>

      <Grid container style={{ marginTop: "2em" }}>
        <Grid item md={12}>
          <WaterSensorByGatewayTopbar
            bareNodes={bareNodeSerialNo}
            coverNodes={coverNodeSerialNo}
            activeChip={activeChip}
            setActiveChip={setActiveChip}
          />
        </Grid>
        <Grid item md={12}>
          <NodeSensorVisual
            bareNodeSerialNo={bareNodeSerialNo}
            coverNodeSerialNo={coverNodeSerialNo}
            activeChip={activeChip}
            chartWidth={12}
          />
        </Grid>
      </Grid>
    </div>
  ) : (
    "Loading..."
  );
};

export default WaterSensorByGateway;