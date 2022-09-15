import { notification } from "antd";
import "./Notify.module.less";
const createNotification = (type, message, description) => {
  notification[type]({
    message,
    description,
    className: "class_test",
  });
};

export default createNotification;
