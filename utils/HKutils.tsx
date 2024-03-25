import Moment from "react-moment";
import moment from "moment";

const BetterLogs = (message: any) => {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
  console.log(`${timestamp}: ${message}`);
};

export { BetterLogs };
