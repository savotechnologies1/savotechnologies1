const actions = {
  SET_USER_DATA: "auth/SET_USER_DATA",
  SET_SEARCH_OPTIONS: "auth/SET_SEARCH_OPTIONS",
  SET_MATCH_OPTIONS: "auth/SET_MATCH_OPTIONS",
  SET_USER_PROFILE: "auth/SET_USER_PROFILE",
  SET_USER_SETTINGS: "auth/SET_USER_SETTINGS",
  SET_CITY_LIST: "auth/SET_CITY_LIST",
  SET_COUNTRY_LIST: "auth/SET_COUNTRY_LIST",
  SET_TIMEZONE_LIST: "auth/SET_TIMEZONE_LIST",
  SET_PEOPLE_LIST: "auth/SET_PEOPLE_LIST",
  SET_RES_STATUS: "auth/SET_RES_STATUS",
  SET_ATTACHMENTS: "auth/SET_ATTACHMENTS",
  SET_BADGECOUNT: "auth/SET_BADGECOUNT",
  SET_CHATSUMMARY: "auth/SET_CHATSUMMARY",
  SET_APPSETTINGS: "auth/SET_APPSETTINGS",
  SET_NOTIFICATIONS: "auth/SET_NOTIFICATIONS",
  SET_REGISTER_GENDER: "auth/SET_REGISTER_GENDER",

  setUserData: (token, uData) => (dispatch) => {
    return dispatch({
      type: actions.SET_USER_DATA,
      accsessToken: token,
      userData: uData,
    });
  },
  setUserProfile: (userProfile) => (dispatch) => {
    return dispatch({
      type: actions.SET_USER_PROFILE,
      userProfile: userProfile,
    });
  },
  setUserSettings: (userSettings) => (dispatch) => {
    return dispatch({
      type: actions.SET_USER_SETTINGS,
      userSettings: userSettings,
    });
  },
  setSearchOptions: (searchOptions) => (dispatch) => {
    return dispatch({
      type: actions.SET_SEARCH_OPTIONS,
      searchOptions: searchOptions,
    });
  },
  setMatchOptions: (matchOptions) => (dispatch) => {
    return dispatch({
      type: actions.SET_MATCH_OPTIONS,
      matchOptions: matchOptions,
    });
  },
  setCityList: (cityList) => (dispatch) => {
    return dispatch({
      type: actions.SET_CITY_LIST,
      cityList: cityList,
    });
  },
  setCountryList: (countryList) => (dispatch) => {
    return dispatch({
      type: actions.SET_COUNTRY_LIST,
      countryList: countryList,
    });
  },
  setTimezoneList: (tz) => (dispatch) => {
    return dispatch({
      type: actions.SET_TIMEZONE_LIST,
      timezoneList: tz,
    });
  },
  setAppSettings: (appSettings) => (dispatch) => {
    return dispatch({
      type: actions.SET_APPSETTINGS,
      appSettings: appSettings,
    });
  },
  setPeopleList: (peopleList) => (dispatch) => {
    return dispatch({
      type: actions.SET_PEOPLE_LIST,
      peopleList: peopleList,
    });
  },
  setResStatus: (resStatus) => (dispatch) => {
    return dispatch({
      type: actions.SET_RES_STATUS,
      resStatus: resStatus,
    });
  },
  setAttachments: (attachments) => (dispatch) => {
    return dispatch({
      type: actions.SET_ATTACHMENTS,
      attachments: attachments,
    });
  },
  setBadgeCount: (badgeCount) => (dispatch) => {
    return dispatch({
      type: actions.SET_BADGECOUNT,
      badgeCount: badgeCount,
    });
  },
  setChatSummary: (chatSummary) => (dispatch) => {
    return dispatch({
      type: actions.SET_CHATSUMMARY,
      chatSummary: chatSummary,
    });
  },
  setNotifications: (notifications) => (dispatch) => {
    return dispatch({
      type: actions.SET_NOTIFICATIONS,
      notifications: notifications,
    });
  },
  setRegisterGender: (registerGender) => (dispatch) => {
    return dispatch({
      type: actions.SET_REGISTER_GENDER,
      registerGender: registerGender,
    });
  },
};

export default actions;
