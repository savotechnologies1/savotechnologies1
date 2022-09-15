const prod = process.env.NODE_ENV === "production";

export default {
  siteName: "TrueBrides",
  siteIcon: "",
  domainUrl: prod ? "https://truebrides.com" : "http://localhost:3000",
  apiUrl: "https://core.truebrides.com/api/",
  imgUrl: "https://images.truebrides.com/",
  hubUrl: "https://core.truebrides.com/",
};
