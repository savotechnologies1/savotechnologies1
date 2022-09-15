import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import { Row, Col, Button, Popover, Upload } from "antd";
import {
  HeartOutlined,
  CameraOutlined,
  PictureOutlined,
  HeartFilled,
  LeftOutlined,
} from "@ant-design/icons";
import "./Cover.module.less";
import {
  setPhotoAsProfile,
  uploadCoverPhoto,
  uploadPhoto,
  validateImage,
} from "@redux/utils/commonFunctions";
import siteConfig from "@config/siteConfig";
import { has, isEmpty } from "lodash";
import fetchHelper from "@redux/utils/apiHelper";
import ImgCrop from "antd-img-crop";
import Gallery from "@components/Gallery/Gallery";
import AuthActions from "@redux/reducers/auth/actions";
import Lightbox from "react-image-lightbox";
import useCurrentScreen from "@redux/utils/useCurrentScreen";
import { ChatContext } from "@components";
import "antd/es/modal/style";
import "antd/es/slider/style";

function Cover(props) {
  const { data, editable, profilePicPath, onUploadSuccess, onUpdate } = props;
  const { setResStatus } = AuthActions;
  const cc = useContext(ChatContext);
  const dispatch = useDispatch();
  const { token, userData, userProfile } = useSelector((state) => state.auth);
  const isMobile = ["xs"].includes(useCurrentScreen());
  const isLg = ["lg", "md", "sm"].includes(useCurrentScreen());
  const [myCredits, setMyCredits] = useState(0);
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [favourite, setFavourite] = useState(false);
  const [favObj, setFavObj] = useState({});
  const [openGallery, setOpenGallery] = useState(false);
  const [startLoader, setStarLoader] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    let fav = false;
    let favO = {};
    if (
      has(userProfile.user, "favorites") &&
      !isEmpty(userProfile.user.favorites)
    ) {
      userProfile?.user?.favorites.map((v) => {
        if (v.sourceId == userData?.id && v.targetId === data.userId) {
          fav = true;
          favO = v;
        }
      });
    }
    if (fav) {
      setFavourite(fav);
      setFavObj(favO);
    } else {
      setFavourite(false);
      setFavObj({});
    }
    const cred = userProfile?.user?.settings?.credit;
    setMyCredits(cred);
  }, [userProfile]);

  const handleFavourite = async () => {
    setStarLoader(true);
    let url = `Users/${data.userId}/ToggleLike`;
    try {
      let res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!has(res, "ErrorCode") && res) {
        onUploadSuccess(true);
      } else {
        if (res.message || res.Message) {
          // Notify("error", "Oops!", res.message || res.Message);
        }
      }
      setStarLoader(false);
    } catch (error) {
      setStarLoader(false);
      console.log(error);
    }
  };

  const handleProfileImage = async (info) => {
    setVisible(false); //close menu
    setUploadLoading(true);
    const imageVal = validateImage(info);
    if (imageVal) {
      try {
        const status = await uploadPhoto(token, info, true);
        if (status === "success") {
          onUploadSuccess();
          setUploadLoading(false);
        }
      } catch (error) {
        setUploadLoading(false);
        console.log(error);
      }
    } else {
      setUploadLoading(false);
    }
  };

  const handleCoverImage = async (info) => {
    setLoading(true);
    const imageVal = validateImage(info);
    if (imageVal) {
      try {
        const status = await uploadCoverPhoto(token, info, true);
        if (status === "success") {
          onUpdate();
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        console.log("error =>", error);
      }
    } else {
      setLoading(false);
    }
  };

  const handlePaymentRefill = () => {
    dispatch(setResStatus(402));
  };

  const contentData = () => {
    return (
      <>
        <Row className="uploadPhotoRow">
          <ImgCrop shape="round" quality={0.8} grid={true}>
            <Upload showUploadList={false} beforeUpload={handleProfileImage}>
              <Button
                className="takephotoBtn"
                icon={<PictureOutlined className="fbIconBtn" />}
                onClick={() => setVisible(false)}
              >
                UPLOAD PROFILE PHOTO
              </Button>
            </Upload>
          </ImgCrop>
        </Row>
      </>
    );
  };

  return (
    <>
      <Row justify="space-between" className="headBtnCover">
        <Col offset={1} span={22} className="coverHeadCol">
          <Col>
            <Button
              className="backBtn"
              onClick={() => router.back()}
              icon={<LeftOutlined />}
            />
          </Col>
          <Col>
            {editable ? (
              <>
                {userData?.userType === "Male" ? (
                  <>
                    <Button
                      className="creditBtn"
                      onClick={() => handlePaymentRefill()}
                    >
                      {`${myCredits === 0 ? "0" : myCredits} CREDITS`}
                      <span className="refillSpan">TOP UP</span>
                    </Button>
                  </>
                ) : null}
              </>
            ) : (
              <Button
                loading={startLoader}
                disabled={startLoader}
                className="fvrtIcon"
                type="ghost"
                shape="circle"
                onClick={() => handleFavourite()}
                icon={!favourite ? <HeartOutlined /> : <HeartFilled />}
              />
            )}
          </Col>
        </Col>
      </Row>
      <Row justify="center" className="coverImgRow">
        <Col>
          {editable ? (
            <Popover
              overlayClassName="gallery_clickPopOver"
              trigger="click"
              placement="bottom"
              content={contentData}
              visible={visible}
              arrowPointAtCenter={true}
              onVisibleChange={(visible) => setVisible(visible)}
            >
              <img
                src={profilePicPath}
                className="uploadProfileImg"
                onError={(e) => {
                  e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                }}
              />

              <Button
                loading={uploadLoading}
                disabled={uploadLoading}
                className="coverUploadBtn"
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
              />
            </Popover>
          ) : (
            <Col>
              <img
                src={profilePicPath}
                className="uploadProfileImg"
                onDragStart={(e) => e.preventDefault()}
                onError={(e) => {
                  e.currentTarget.src = `${siteConfig.imgUrl}images/blank-profile-picture.png`;
                }}
                onClick={() => setImgOpen(true)}
              />
              <div
                className={
                  data.user.online === true
                    ? "coverOnlineIcon"
                    : "coverOfflineIcon"
                }
              />
            </Col>
          )}
        </Col>
        <Col offset={1} span={21} className="coverUploadCol">
          {editable && (
            <ImgCrop quality={0.8} shape="rect" aspect={16 / 4}>
              <Upload showUploadList={false} beforeUpload={handleCoverImage}>
                {isMobile || (isLg && cc?.isChatOpen) ? (
                  <Button
                    loading={loading}
                    disabled={loading}
                    className="coverUploadBtn"
                    icon={<CameraOutlined className="fbIconBtn" />}
                  />
                ) : (
                  <Button
                    loading={loading}
                    disabled={loading}
                    type="primary"
                    shape="round"
                    className="backBtn"
                  >
                    Upload Cover
                  </Button>
                )}
              </Upload>
            </ImgCrop>
          )}
        </Col>
        <Gallery
          allowMultiselect={false}
          visible={openGallery}
          dismiss={() => setOpenGallery(false)}
          onSelect={(o) => setPhotoAsProfile(o.id, o.ownerId)}
        />
      </Row>
      {imgOpen && (
        <Lightbox
          discourageDownloads
          enableZoom={false}
          mainSrc={profilePicPath}
          onCloseRequest={() => setImgOpen(false)}
        />
      )}
    </>
  );
}

Cover.defaultProps = {
  data: {},
  editable: false,
  profilePicPath: "",
  onUploadSuccess: () => {},
  onUpdate: () => {},
};

Cover.propTypes = {
  data: PropTypes.object,
  editable: PropTypes.bool,
  profilePicPath: PropTypes.string,
  onUploadSuccess: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default Cover;
