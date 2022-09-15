import React from "react";
import Images from "@config/images";
import {
  InstagramOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

export const ageGroup1 = [18, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];
export const ageGroup2 = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

export const childrenCount = [
  {
    value: null,
    label: "Select",
  },
  {
    value: false,
    label: "No Child",
  },
  {
    value: true,
    label: "Have Children",
  },
];

export const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const monthnumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const yearNumber = [
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41,
];
export const day = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
];
export const year = [
  1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948,
  1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961,
  1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974,
  1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987,
  1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
  2001, 2002, 2003,
];
export const footerData = [
  {
    id: 1,
    text: "About",
    type: "about",
  },
  {
    id: 2,
    text: "Terms Of Use",
    type: "terms",
  },
  {
    id: 3,
    text: "Privacy Policy",
    type: "privacy",
  },
  {
    id: 4,
    text: "Refund Policy",
    type: "refund",
  },
  {
    id: 5,
    text: "Anti-Scam Policy",
    type: "antiscam",
  },
  {
    id: 6,
    text: "Help Center",
    type: "help",
  },
];
export const footerFollowData = [
  {
    id: 1,
    icon: <FacebookOutlined />,
    text: "Facebook",
    url: "https://www.facebook.com/truebrides",
  },
  {
    id: 2,
    icon: <InstagramOutlined />,
    text: "Instagram",
    url: "https://www.instagram.com/truebrides/",
  },
  {
    id: 3,
    icon: <YoutubeOutlined />,
    text: "Youtube",
    url: "https://www.youtube.com/channel/UCR0m-Yd0haiAZW1aLtVGH1g",
  },
  {
    id: 4,
    icon: <TwitterOutlined />,
    text: "Twitter",
    url: "https://twitter.com/truebrides",
  },
];
export const featuredData = [
  {
    id: 1,
    img: Images.communication,
    title: "Affordable",
    Text: "Our services are one of the most affordable prices in the industry. We believe love is for everyone!",
  },
  {
    id: 1,
    img: Images.protection,
    title: "Safe",
    Text: "Providing secure dating with a proven anti-scam system, so you won't be worried while finding your bride.",
  },
  {
    id: 1,
    img: Images.verification,
    title: "100% True",
    Text: "Verified profiles go through serious background checks and identity verification.",
  },
];
export const height = [
  "122",
  "125",
  "128",
  "130",
  "133",
  "135",
  "137",
  "140",
  "142",
  "145",
  "147",
  "150",
  "152",
  "155",
  "157",
  "160",
  "162",
  "165",
  "167",
  "170",
  "172",
  "175",
  "177",
  "180",
  "182",
  "185",
  "187",
  "190",
  "192",
  "195",
  "198",
  "201",
  "203",
  "205",
  "208",
  "211",
  "213",
  "216",
  "218",
  "221",
  "223",
  "225",
  "228",
  "230",
];
export const blogStaticCardSlide1 = [
  {
    id: 1,
    img: Images.blogimage1,
    title: "WHAT IF I AM NOT LOOKING FOR MARRIAGE?",
    bio: "There is no restriction to look only for a bride or marriage. We also welcome people who have different preferences when it comes to relationships. You can personally ask women and read their bios to understand what kind of relationship they like to find on our site.",
  },
  {
    id: 2,
    img: Images.blogimage2,
    title: "DO I HAVE TO TRAVEL TO UKRAINE OR RUSSIA?",
    bio: "TrueBrides has users from many different countries as well as from the United States. You can use the search filter to find a date that suits you the most. If you are talking to a woman from Ukraine and Russia, you don't have to visit her but to build trust, it is recommended to make the first meeting at least in her home country.",
  },
  {
    id: 3,
    img: Images.blogimage3,
    title: "WHY DO I NEED A RUSSIAN WOMAN?",
    bio: "If you haven't had a relationship with a Russian woman, you may ask yourself, why do I need a Russian woman? Online dating is very popular now, and it doesn't restrict you to your own circle. Sometimes another town, sometimes another city, and sometimes another country. Russian women especially are the most notable and precious ones if you are looking for a woman from another country and culture. Many American men stated that Russian women are the best choice.",
  },
];
export const blogStaticCardSlide2 = [
  {
    id: 1,
    img: Images.blogimage4,
    title: "DOES THE AGE DIFFERENCE MATTER?",
    bio: "Russian women have more tolerance to age differences than American women. Because they value other features you have than your age. There isn't any prejudice in Russian culture when there is a big age gap between partners.",
  },
  {
    id: 2,
    img: Images.blogimage5,
    title: "WHY TRUEBRIDES IS BETTER THAN OTHER DATING SITES?",
    bio: "Cheaper, Safer, True, these three words explain us the most. First of all, we believe online dating has to be much more affordable, compared to our competitors, we offer much cheaper prices. And, while we offer cheaper prices, our quality of service is much higher. Safety is first, and we are doing our best to protect our users from scammers. We have a one-strike policy, so if you are requested to send money, the user who requested is deleted permanently after the review.",
  },
  {
    id: 3,
    img: Images.blogimage6,
    title: "WHAT SHOULD I EXPECT ON THE FIRST DATE?",
    bio: "If you have communicated with another member, you can set up a date over our site by just going to their profile. Regardless of the level of communication, you should always be aware that personal meetings may have different phases than online dating. That's why it is better to let the other person get used to you before jumping to the next stage.",
  },
];
export const aboutMeData = [
  {
    id: 1,
    title: "Lives in",
    key: "cityId",
    answer: "No answer",
  },
  {
    id: 2,
    title: "Works as",
    key: "profession",
    answer: "No answer",
  },
  {
    id: 5,
    key: "maritialStatus",
    title: "Relationship",
    answer: "No answer",
  },
  {
    id: 15,
    key: "childrenCount",
    title: "Children",
    answer: "No answer",
  },
  {
    id: 4,
    title: "Level of English",
    key: "englishProficiency",
    answer: "No answer",
  },
  {
    id: 3,
    title: "Education",
    key: "education",
    answer: "No answer",
  },
  {
    id: 14,
    key: "religion",
    title: "Religion",
    answer: "No answer",
  },
  {
    id: 9,
    title: "Height",
    key: "height",
    answer: "No answer",
  },
  {
    id: 10,
    title: "Weight",
    key: "weight",
    answer: "No answer",
  },
  {
    id: 11,
    key: "bodyType",
    title: "Body Type",
    answer: "No answer",
  },
  {
    id: 13,
    title: "Hair Color",
    key: "hairColor",
    answer: "No answer",
  },
  {
    id: 12,
    title: "Eye Color",
    key: "eyeColor",
    answer: "No answer",
  },
  {
    id: 8,
    title: "Drinking",
    key: "alcohol",
    answer: "No answer",
  },
  {
    id: 7,
    title: "Smoking",
    key: "smoking",
    answer: "No answer",
  },
];

export const haveChildrens = [
  {
    value: 1,
    label: "1 Child",
  },
  {
    value: 2,
    label: "2 Children",
  },
  {
    value: 3,
    label: "3 Children",
  },
  {
    value: 4,
    label: "4 Children",
  },
  {
    value: 5,
    label: "5 Children",
  },
  {
    value: 6,
    label: "More than 5",
  },
];

export const staticPageData = [
  {
    title: "Privacy Policy",
    text: "When you visit any website, you are providing a range of personal information about your visit to the operators of the website, depending on the actions you take. This is also the case with Dating.com. You should always understand the privacy policies on any website when supplying information during your use of the website. You should always ask for a copy of the privacy policy if the website does not make the information available to you.<br/> We will only use the personal data you send to us during your visits for the purposes of internal tracking. This includes the activities of making dating.com and other our websites more effective for you to use our website’s features and services and responding appropriately to your requests for information. Unless specifically mentioned, we do not use your personal data for any other reason. We will never sell your personal data to a third party, and we will never give a third party access to your personal data, except as may be provided in our Terms of Use Agreement or Privacy Policy or unless required to do so by law.",
  },
  {
    title: "Types of personal data collected",
    text: "Personal data requests and user registration. <br/> When you use or register on the dating.com website, we only collect personal data that you provide of your own accord. It is possible to browse our website without registering, but you will need to register for the purpose of using certain features and services that we offer. By registering on our website you will provide and share your personal data with the public and with other users. Something that is public can be seen by anyone. For example, the personal data you provide in section «About Me», your name,gender, username, user ID, profile picture, photos and videos. This personal data is made available to the public to help connect you with other website users. Please be advised that public personal data can show up when someone does a search on dating.com or on another search engine. In some cases, people you share and communicate with may download or copy the content you provided to them or make it public. Use caution about the personal data you share with others.",
  },
  {
    title: "Age restriction",
    text: "Children under 18 years of age are not allowed to use our website and our services are not targeted at children under the age of 18. In accordance with the Children’s Online Privacy Protection Act, any personal data we receive from users we believe to be aged 18 or under will be removed from our database.",
  },
  {
    title: "Mode and place of processing the personal data",
    text: "The Data controller processes the personal data of users of dating.com in a proper manner and shall take appropriate security measures to prevent unauthorized access, disclosure, modification or unauthorized destruction of the personal data. <br/> The personal data processing is carried out using computers and/or IT enabled tools, following organizational procedures and modes strictly related to the purposes indicated. In addition to the Data controller, in some cases, the personal data may be accessible to certain types of persons in charge, involved with the operation of the website (administration, sales, marketing, legal, system administration) or external parties (such as third party technical service providers, mail carriers, hosting providers, IT companies, communication agencies) appointed, if necessary, as Data Processors by the Data controller. <br/> The Data controller has secure certificates from VeriSign and McAfee that show the website is approved, fully tested, and certified by these two expert security systems. This means that you are safe from any viruses, identity theft, spyware, fraudulent credit card activity, spam, and internet scams. <br /> The Personal data is processed at the Data controller’s operating offices and in any other place where the parties involved with the processing are located",
  },
];
