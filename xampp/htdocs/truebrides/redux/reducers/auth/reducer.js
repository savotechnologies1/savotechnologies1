import types from "./actions";

const initialState = {
  token: "",
  userData: {},
  userProfile: {}, //Full User's Profile Details
  searchOptions: [], //List of all options
  matchOptions: [], // List of search applied search filters
  cityList: [], // List of All cities of all countries
  countryList: [], // List of all countries
  timezoneList: [], // List of all Timezones
  peopleList: [], // Home Page list of loaded Profiles
  resStatus: "", // Api status codes:-> 401 -> Go to Login Page, 402 -> Open Payment Modal, 404 or 405 -> Some problem on backend
  attachments: [],
  badgeCount: {
    inbox: 0,
    starred: 0,
    sent: 0,
    draft: 0,
    trash: 0,
  }, // Notification Badge Counts For Emails
  chatSummary: [],
  appSettings: [],
  userSettings: {},
  notifications: [],
  registerGender: null, // true = male and false = female,
};

export default function reducer(state = initialState, actions) {
  switch (actions.type) {
    case "persist/REHYDRATE":
      if (
        actions.payload &&
        actions.payload.auth &&
        actions.payload.auth.dataChanged
      ) {
        return {
          ...state,
          ...actions.payload.auth,
          dataChanged: false,
        };
      }
      return state;
    case types.SET_USER_DATA:
      return {
        ...state,
        token: actions.accsessToken,
        userData: actions.userData,
      };
    case types.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: actions.userProfile,
      };
    case types.SET_USER_SETTINGS:
      return {
        ...state,
        userSettings: actions.userSettings,
      };
    case types.SET_SEARCH_OPTIONS:
      return {
        ...state,
        searchOptions: actions.searchOptions,
      };
    case types.SET_MATCH_OPTIONS:
      return {
        ...state,
        matchOptions: actions.matchOptions,
      };
    case types.SET_CITY_LIST:
      return {
        ...state,
        cityList: actions.cityList,
      };
    case types.SET_COUNTRY_LIST:
      return {
        ...state,
        countryList: actions.countryList,
      };
    case types.SET_TIMEZONE_LIST:
      return {
        ...state,
        timezoneList: actions.timezoneList,
      };
    case types.SET_PEOPLE_LIST:
      return {
        ...state,
        peopleList: actions.peopleList,
      };
    case types.SET_RES_STATUS:
      return {
        ...state,
        resStatus: actions.resStatus,
      };
    case types.SET_ATTACHMENTS:
      return {
        ...state,
        attachments: actions.attachments,
      };
    case types.SET_BADGECOUNT:
      return {
        ...state,
        badgeCount: actions.badgeCount,
      };
    case types.SET_CHATSUMMARY:
      return {
        ...state,
        chatSummary: actions.chatSummary,
      };
    case types.SET_APPSETTINGS:
      return {
        ...state,
        appSettings: actions.appSettings,
      };
    case types.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: actions.notifications,
      };
    case types.SET_REGISTER_GENDER:
      return {
        ...state,
        registerGender: actions.registerGender,
      };
    default:
      return state;
  }
}
