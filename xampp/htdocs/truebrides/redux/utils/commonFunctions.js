import { message } from "antd";
import {
  has,
  capitalize,
  startCase,
  isEmpty,
  map,
  uniq,
  isArray,
} from "lodash-es";
import fetchHelper from "@redux/utils/apiHelper";
import { Notify } from "@components";
import AuthActions from "@redux/reducers/auth/actions";
import moment from "moment";

export function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

export function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function displayHeight(cm) {
  var totalInches = cm * 0.3937;
  var inches = Math.round(totalInches % 12);
  var feet = Math.floor(totalInches / 12); 
  if (inches === 12)
  { feet += 1; inches = 0;}
  return `${feet + '\'' + inches + '\"'} - ${cm} cm`;
}

export function displayWeight(w) {
  if (Number(w) && w > 0) {
    return `${w} kg - ${Number(w / 0.45359237).toFixed(2)} lbs`;
  }
  return w;
}

export function displayChildCount(cc) {
  if (Number(cc) && cc > 0) {
    return cc;
  }
}

export async function getAppSettings() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;
  let url = `App/Settings`;
  try {
    const res = await fetchHelper(url, {}, "GET", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (!has(res, "ErrorCode")) {
      store.dispatch(AuthActions.setAppSettings(res));
    } else {
      Notify(
        "error",
        "Oops!",
        res.message || res.Message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export function getConversationId(targetuserId) {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  const found = store
    .getState()
    .auth?.chatSummary.find((obj) => obj.opposingUserId === targetuserId);

  if (found) {
    return found.conversationId;
  } else {
    return 0;
  }
}

export async function getChatSummary() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  let url = `ChatMessages/GetChatSummary`;
  try {
    const res = await fetchHelper(url, {}, "GET", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (!has(res, "ErrorCode")) {
      store.dispatch(AuthActions.setChatSummary(res));
    } else {
      Notify(
        "error",
        "Oops!",
        res.message || res.Message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export async function getBadgeCount() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  let url = `Mails/badge-counts`;
  try {
    const res = await fetchHelper(url, {}, "GET", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (!has(res, "ErrorCode")) {
      store.dispatch(AuthActions.setBadgeCount(res));
    } else {
      Notify(
        "error",
        "Oops!",
        res.message || res.Message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log("error while setting badge", error);
  }
}

export async function getLatestNotifications(count = 10) {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  let url = `SiteNotifications/Latest?count=${count}`;
  try {
    const res = await fetchHelper(url, {}, "GET", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (!has(res, "ErrorCode") && isArray(res)) {
      store.dispatch(AuthActions.setNotifications(res));
    } else {
      Notify(
        "error",
        "Oops!",
        res.message || res.Message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log("error while setting badge", error);
  }
}

export async function getAttachments() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  let url = `Attachments/User/${store.getState().auth.userData.id}`;
  try {
    const res = await fetchHelper(url, {}, "GET", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (!has(res, "ErrorCode")) {
      store.dispatch(AuthActions.setAttachments(res));
    } else {
      Notify(
        "error",
        "Oops!",
        res.message || res.Message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export function getDaysFar(date) {
  let now = moment().format("YYYY-MM-DDTHH:mm:ss.SSSS");
  let diff = moment(now).diff(date, "day");
  let label = date.format("DD-MM-YYYY");
  if (diff == 0) {
    label = "Today";
  }
  if (diff == 1) {
    label = "Yesterday";
  }
  if (diff > 1 && diff < 7) {
    label = date.format("dddd");
  }
  return label;
}

export function getNotiDateFormat(date) {
  return moment(date).fromNow();
}

export function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

export async function setPhotoAsProfile(photoId, userId) {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  //! Call to set pic as profile picture
  let url2 = `PhotoUsers/SetProfilePicture`;
  let photos = {
    photoId: photoId,
    userId: userId,
  };
  try {
    const res = await fetchHelper(url2, photos, "POST", {
      Authorization: `Bearer ${store.getState().auth.token}`,
    });
    if (has(res, "ErrorCode")) {
      Notify(
        "error",
        "Oops!",
        res.message || res.message || "Something went wrong"
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export async function uploadPhoto(token, imageToUpload, setAsProfile = false) {
  return new Promise(async (resolve, reject) => {
    var fd = new FormData();
    fd.append("USER", imageToUpload);
    let url = `PhotoUsers/Upload`;
    try {
      const res = await fetchHelper(
        url,
        fd,
        "POST",
        {
          Authorization: `Bearer ${token}`,
        },
        true
      );
      if (setAsProfile && !isEmpty(res) && res[0].photoId && res[0].userId) {
        //! Call to set pic as profile picture
        let url2 = `PhotoUsers/SetProfilePicture`;
        let photos = {
          photoId: res[0].photoId,
          userId: res[0].userId,
        };
        try {
          const res = await fetchHelper(url2, photos, "POST", {
            Authorization: `Bearer ${token}`,
          });
          if (res) {
            resolve("success");
          } else {
            Notify("error", "Oops!", "Something went wrong");
            reject({ photoUpload: "success", setAsProfile: "fail" });
          }
        } catch (error) {
          reject({ photoUpload: "success", setAsProfile: "fail" });
          console.log(error);
        }
      }
      if (!isEmpty(res)) {
        Notify("success", "Success!", "Photo uploaded");
        resolve("success");
      }
    } catch (error) {
      console.log(error);
      Notify("error", "Oops!", "Something went wrong while uploading photo");
      reject(error);
    }
  });
}

export async function uploadCoverPhoto(token, imageToUpload) {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;
  let type = store.getState().auth?.userData?.userType;
  return new Promise(async (resolve, reject) => {
    var fd = new FormData();
    fd.append("USER", imageToUpload);
    let url = `UserCovers/Upload`;
    try {
      const res = await fetchHelper(
        url,
        fd,
        "POST",
        {
          Authorization: `Bearer ${token}`,
        },
        true
      );
      if (!isEmpty(res)) {
        Notify("success", "Success!", "Photo uploaded");
        resolve("success");
      }
    } catch (error) {
      console.log(error);
      Notify("error", "Oops!", "Something went wrong while uploading photo");
      reject(error);
    }
  });
}

export async function getMyProfileData() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;
  let type = store.getState().auth?.userData?.userType;

  return new Promise(async (resolve, reject) => {
    try {
      let url = `${type === "Male" ? "Males" : "Females"}/CurrentUser`;
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${store.getState().auth.token}`,
      });
      if (!isEmpty(res)) {
        store.dispatch(AuthActions.setUserProfile(res));
        resolve(res);
      } else {
        reject("response empty");
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

export async function getMySettings() {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;
  let uid = store.getState().auth?.userData?.id;
  return new Promise(async (resolve, reject) => {
    try {
      let url = `UserSettings/${uid}`;
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${store.getState().auth.token}`,
      });
      if (!isEmpty(res)) {
        store.dispatch(AuthActions.setUserSettings(res));
        resolve(res);
      } else {
        reject("response empty");
      }
    } catch (error) {
      console.log("EEE", error);
      reject(error);
    }
  });
}

export async function markNotiRead(item) {
  let store =
    typeof window !== "undefined" ? window.__NEXT_REDUX_WRAPPER_STORE__ : false;

  return new Promise(async (resolve, reject) => {
    try {
      let url = `SiteNotifications/${item.id}/Read`;
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${store.getState().auth.token}`,
      });
      if (res) {
        let notis = store.getState().auth.notifications;
        let found = notis.findIndex((it) => it.id === item.id);
        if (found >= 0) {
          notis.splice(found, 1, {
            ...item,
            readDate: true,
          });
          store.dispatch(AuthActions.setNotifications(notis));
        }
        resolve(res);
      } else {
        reject("response empty");
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

export function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor + "20";
}

export function validateImage(file) {
  const isJpg = file.type === "image/jpeg";
  if (!isJpg) {
    message.error("You can only upload JPG file!");
    return;
  }
  const isLt2M = file.size / 1024 / 1024 < 16;
  if (!isLt2M) {
    message.error("Image must smaller than 16MB!");
  }
  return isJpg && isLt2M;
}

export function coverValidateImg(file) {
  const isJpg = file.type === "image/jpeg";
  if (!isJpg) {
    message.error("You can only upload JPG file!");
    return;
  }
  if (file.size > 16777216) {
    message.error("Image must smaller than 16MB!");
  }
  return isJpg;
}

const availableParams = [
  "EYE_COLOR",
  "MARITAL_STATUS",
  "EDUCATION",
  "SMOKING",
  "ENGLISH_PROF",
  "BODY_TYPE",
  "RELIGION",
  "DRINKING",
  "HAIR_COLOR",
  "INTERESTS",
];

const getKey = (code) => {
  if (code === "EYE_COLOR") return "eyeColors";
  if (code === "MARITAL_STATUS") return "maritalStatuses";
  if (code === "EDUCATION") return "educations";
  if (code === "SMOKING") return "smokings";
  if (code === "ENGLISH_PROF") return "englishProficiencies";
  if (code === "BODY_TYPE") return "bodyTypes";
  if (code === "RELIGION") return "religions";
  if (code === "DRINKING") return "alcohols";
  if (code === "HAIR_COLOR") return "hairColors";
  if (code === "INTERESTS") return "interests";
};

export async function getSearchAndFilterOptions() {
  let url = "Parameters/GetAll";
  try {
    const res = await fetchHelper(url, {}, "GET");
    if (!isEmpty(res)) {
      const groupCodes = uniq(map(res, "groupCode"));
      const optionsObj = [];
      map(groupCodes, (i) => {
        //Map only available Params
        if (availableParams.includes(i)) {
          optionsObj.push({
            code: i,
            name: capitalize(startCase(i)),
            data: [],
            display: false,
          });
        }
      });
      let categorizedOptions = map(optionsObj, (opt) => {
        let optionsDataList = [];
        map(res, (obj) => {
          if (opt?.code === obj.groupCode) {
            optionsDataList.push({ ...obj, key: getKey(obj.groupCode) });
          }
        });
        return {
          ...opt,
          display: !isEmpty(optionsDataList),
          data: optionsDataList,
        };
      });
      return categorizedOptions;
    }
  } catch (error) {
    console.log(error);
  }
}
