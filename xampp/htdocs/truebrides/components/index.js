import React from "react";
import CHeader from "./Layout/Header/CHeader";
import PeopleCard from "./PeoplePage/PeopleCard/PeopleCard";
import ContentData from "./PeoplePage/Content/ContentData";
import Notify from "./Notify/Notify";
import MyContact from "./PeoplePage/SideBar/MyContacts/MyContact";
import Chat from "./PeoplePage/SideBar/Chat/Chat";
import CImg from "./CImg/CImg";
import SearchModal from "./PeoplePage/SearchModal/SearchModal";
import TopSection from "./NewLandingPage/TopSection/TopSection";
import NewFeatured from "./NewLandingPage/Services/Services";
import VideoPlay from "./NewLandingPage/VideoPlay/VideoPlay";
import SignupFooter from "./NewLandingPage/SignupFooter/SignupFooter";
import SingleBlog from "./NewLandingPage/SingleBlog/SingleBlog";
import NewFooter from "./NewLandingPage/NewFooter/NewFooter";
import Members from "./NewLandingPage/Members/Members";
import Promotion from "./promotionPage/Promotion";
import Promotionfooter from "./promotionPage/Promotionfooter";
import AboutYouModal from "./AboutYouModal/AboutYouModal";
import StepsCircle from "./StepsCircle/StepsCircle";
import ProfileIndex from "./PeoplePage/Profile/ProfileIndex";
import Cover from "./PeoplePage/Profile/CoverContent/Cover";
import AddPhotos from "./PeoplePage/Profile/AddPhotos/AddPhotos";
import MyInterests from "./PeoplePage/Profile/MyInterests/MyInterests";
import AboutMe from "./PeoplePage/Profile/AboutMe/AboutMe";
import Gifts from "./PeoplePage/Profile/Gifts/Gifts";
import LookingFor from "./PeoplePage/Profile/LookingFor/LookingFor";
import AffixPopMenuData from "./PeoplePage/Profile/AffixPopMenuData/AffixPopMenuData";
import BioModal from "./PeoplePage/Profile/CoverContent/BioModal";
import NameEdit from "./PeoplePage/Profile/CoverContent/NameEdit";
import DateRequestModal from "./PeoplePage/Profile/Gifts/DateRequestModal";
import ContactExchnage from "./PeoplePage/Profile/Gifts/ContactExchange";
import ContactTable from "./PeoplePage/Profile/Gifts/DataTable/ContactTable/ContactTable";
import DateTable from "./PeoplePage/Profile/Gifts/DataTable/DateTable/DateTable";
import ImageViewer from "./ImageViewer/ImageViewer";
import ImageCropper from "./ImageCropper/ImageCropper";
import Payment from "./PeoplePage/Profile/PaymentModal/Payment";
import Gallery from "./Gallery/Gallery";
import ChatBox from "./PeoplePage/SideBar/Chat/ChatBox";
import MailBox from "./PeoplePage/SideBar/Chat/MailBox";
import Emails from "./PeoplePage/Emails/Emails";
import Header from "./NewLandingPage/Header/Header";
import ShopModal from "./ShopModal/Shop";
import PresentsTable from "./PeoplePage/Profile/Gifts/DataTable/PresentsTable/PresentsTable";
import SettingsModal from "./SettingsModal/Settings";
import HelpCenterModal from "./HelpCenterModal/HelpCenterModal";
import Verifymodal from "../components/VerifyModal/Verifymodal";
import FAQmodal from "./FAQModal/FAQmodal";
import StaticPageModal from "./StaticPageModal"; //COMMON FOR ALL
import FbLogin from "./FacebookLogin";
import GLogin from "./GoogleLogin";




const ChatContext = React.createContext();

export {
  CHeader,
  PeopleCard,
  ContentData,
  Notify,
  MyContact,
  Chat,
  CImg,
  SearchModal,
  TopSection,
  NewFeatured,
  VideoPlay,
  SignupFooter,
  SingleBlog,
  NewFooter,
  Members,
  Promotion,
  Promotionfooter,
  AboutYouModal,
  StepsCircle,
  ProfileIndex,
  Cover,
  AddPhotos,
  MyInterests,
  AboutMe,
  Gifts,
  LookingFor,
  AffixPopMenuData,
  BioModal,
  NameEdit,
  DateRequestModal,
  ContactExchnage,
  ContactTable,
  DateTable,
  ImageViewer,
  ImageCropper,
  Payment,
  Gallery,
  ChatBox,
  MailBox,
  Emails,
  ChatContext,
  Header,
  ShopModal,
  PresentsTable,
  SettingsModal,
  HelpCenterModal,
  Verifymodal,
  FAQmodal,
  FbLogin,
  GLogin,
  StaticPageModal,

};
