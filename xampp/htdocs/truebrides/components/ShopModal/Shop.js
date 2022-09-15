/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Col,
  Empty,
  Form,
  Input,
  Menu,
  message,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Notify } from "@components";
import { has, isEmpty, size } from "lodash";
import fetchHelper from "@redux/utils/apiHelper";
import siteConfig from "@config/siteConfig";
import {
  LeftOutlined,
  RightOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./shop.module.less";
import useCurrentScreen from "@redux/utils/useCurrentScreen";

const { Text, Title } = Typography;
function Shop(props) {
  const { dismiss, visible, receiverId } = props;
  const { token, appSettings } = useSelector((state) => state.auth);
  const [btnLoading, setBtnLoading] = useState(false);
  const [cart, setCart] = useState({});
  const [receiver, setReceiver] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentMenu, setCurrentMenu] = useState("all"); //Tab Menu for Categories
  const [checkoutSwitch, setCheckoutSwitch] = useState(false); // conditon to render cart / checkout.
  const [noteValidation, setNoteValidation] = useState({});

  const [note, setNote] = useState("");

  const [haveRightBtn, setHaveRightBtn] = useState(true);
  const [haveLeftBtn, setHaveLeftBtn] = useState(false);

  const productScrollerRef = useRef();
  const cardRef = useRef();
  //breakpoints conditions
  const isTab = ["sm"].includes(useCurrentScreen());
  const isMobile = ["xs"].includes(useCurrentScreen());

  const MAX_CART_LIMIT = Number(appSettings.maxGiftCount);

  const receiverPhoto = useMemo(() => {
    if (receiver && receiver.recipient && receiver?.recipient?.photos) {
      const pp = receiver?.recipient?.photos.find((p) => p.profilePicture);
      if (pp) {
        return pp.photo.path;
      }
    }
    return "";
  }, [receiver]);

  useEffect(() => {
    createMyCart();
    getProductCategories();
    getProducts();
  }, []);

  useEffect(() => {
    handleScroll();
  }, [products, currentMenu]);

  useEffect(() => {
    if (visible) {
      setCheckoutSwitch(false);
      updateRecipient();
    }
  }, [visible]);

  const handleScroll = (dir) => {
    if (productScrollerRef.current) {
      // Condition to show/hide button
      const right =
        productScrollerRef.current.scrollLeft <
        productScrollerRef.current.scrollWidth -
          productScrollerRef.current.offsetWidth;
      const left = productScrollerRef.current.scrollLeft > 0;

      if (!haveRightBtn && right) {
        setHaveRightBtn(true);
      } else if (haveRightBtn && !right) {
        setHaveRightBtn(false);
      }

      if (!haveLeftBtn && left) {
        setHaveLeftBtn(true);
      } else if (haveLeftBtn && !left) {
        setHaveLeftBtn(false);
      }

      if (dir === "right") {
        productScrollerRef.current.scrollLeft =
          productScrollerRef.current.scrollLeft +
            cardRef.current?.clientWidth ||
          productScrollerRef.current.scrollLeft;
      }
      if (dir === "left") {
        productScrollerRef.current.scrollLeft =
          productScrollerRef.current.scrollLeft -
            cardRef.current?.clientWidth || 0;
      }
    }
  };

  const palceOrder = async () => {
    if (btnLoading) {
      return;
    }
    setBtnLoading(true);
    let url = `Orders/Checkout?note=${note.trim()}`;
    try {
      const res = await fetchHelper(url, {}, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res.id) {
        Notify("success", "Success!", "Your order is placed successfully!");
        dismiss(true);
      } else {
        Notify("error", res.Message);
      }
      setBtnLoading(false);
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
  };

  const createMyCart = async () => {
    let url = `Carts/GetOrCreate`;
    try {
      const res = await fetchHelper(url, {}, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res.id) {
        setCart(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateRecipient = async () => {
    let url = `Carts/UpdateRecipient?femaleId=${receiverId}`;
    try {
      const res = await fetchHelper(url, {}, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res?.id) {
        setReceiver(res);
        setCart(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = async (productId, quantity) => {
    if (quantity > 0 && cart && !isEmpty(cart.products)) {
      let totalProd = cart.products.length;
      const existingProduct = cart.products.findIndex(
        (p) => p.productId === productId
      );
      if (existingProduct == -1) {
        totalProd = totalProd + 1;
      }

      if (totalProd > MAX_CART_LIMIT) {
        message.info(
          `You have reached the maximum limit of your cart. You can not buy more than ${MAX_CART_LIMIT} products.`
        );
        return;
      }
    }
    let url = `Carts/UpdateProduct`;
    try {
      const res = await fetchHelper(url, { productId, quantity }, "PUT", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res?.id && res.id > 0) {
        setCart(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProductCategories = async () => {
    let url = `Categories`;
    try {
      const res = await fetchHelper(url, {}, "GET", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && res.length > 0) {
        setCategories(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async (pagination = false, nextPage = 1) => {
    let url = `Products/GetWithPaging`;
    let data = {
      currentPage: 1,
      pageSize: 50,
      searchTrigger: 1,
      visible: true,
    };
    if (pagination) {
      data.currentPage = nextPage;
    }
    try {
      const res = await fetchHelper(url, data, "POST", {
        Authorization: `Bearer ${token}`,
      });
      if (!isEmpty(res) && has(res, "data")) {
        setProducts(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderProductCarousel = () => {
    let data = products?.data;
    if (currentMenu !== "all") {
      data = products?.data.filter(
        (it) => it?.categories[0]?.categoryId == currentMenu
      );
    }
    if (isEmpty(data)) {
      return (
        <Col xs={24}>
          <Row justify="center" align="middle">
            <Empty description="No products to buy!" />
          </Row>
        </Col>
      );
    }
    return data.map((p) => {
      let qty = 0;
      let maxQty = null;
      let maxReach = false;
      if (!isEmpty(cart) && !isEmpty(cart.products)) {
        const inCart = cart.products.find((item) => item.productId == p.id);
        if (inCart) {
          qty = inCart.quantity;
          maxQty = inCart.product.maxQuantity;
          maxReach = maxQty && maxQty == qty;
        }
      }
      const imgSrc = `${siteConfig.imgUrl}${p.images[0]?.image.path}`;
      return (
        <Col xs={24} sm={12} md={8} lg={6} key={p.id} ref={cardRef}>
          <div className="productCard noselect">
            <div className="productImageContainer">
              <img
                src={imgSrc}
                className="productImg"
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
            <div className="productDescContianer">
              <div className="productText">{p.name}</div>
              <div className="w100">
                <div className="priceText">
                  {`${p.price} `} <span className="creditsText">credits</span>
                </div>
                {qty > 0 ? (
                  <Row>
                    <Col flex="1">
                      <Button
                        type="primary"
                        size="middle"
                        className={qty === 1 ? "delCartBtn" : "addCardBtn"}
                        icon={
                          qty === 1 ? <DeleteOutlined /> : <MinusOutlined />
                        }
                        onClick={() => updateProduct(p.id, qty - 1)}
                      ></Button>
                    </Col>
                    <Col flex="8" className="centerFlex">
                      {qty}
                    </Col>
                    <Col flex="1">
                      <Button
                        disabled={maxReach}
                        icon={<PlusOutlined />}
                        type="primary"
                        size="middle"
                        className={
                          maxReach ? "addCardBtn-disabled" : "addCardBtn"
                        }
                        onClick={() => updateProduct(p.id, qty + 1)}
                      ></Button>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <Button
                      block
                      type="primary"
                      size="middle"
                      className="addCardBtn"
                      onClick={() => updateProduct(p.id, 1)}
                    >
                      Add to cart
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Col>
      );
    });
  };

  const renderShop = () => {
    return (
      <div className="noselect py">
        <Row justify="center" align="middle">
          <Col
            span={24}
            className="menuBtnsContainer2"
            style={
              isMobile || isTab ? { marginRight: 5, paddingRight: 15 } : {}
            }
          >
            <Menu
              theme="light"
              onClick={(e) => setCurrentMenu(e.key.replace("-hidden", ""))}
              selectedKeys={[currentMenu]}
              mode="horizontal"
            >
              {!isEmpty(categories) && categories.length > 0 && (
                <>
                  <Menu.Item key="all">All</Menu.Item>
                  {categories.map((cat) => (
                    <Menu.Item key={cat.id.toString()}>{cat.name}</Menu.Item>
                  ))}
                </>
              )}
            </Menu>
          </Col>
        </Row>
        <Row className="ppx">
          <Col span={1} className="arrowCol absoluteLeft">
            {haveLeftBtn && (
              <LeftOutlined
                className="arrowIconBtns"
                onClick={() => handleScroll("left")}
              />
            )}
          </Col>
          <Col span={isMobile ? 24 : 22}>
            <Row
              className="productsRow"
              ref={productScrollerRef}
              onScroll={handleScroll}
            >
              {!isEmpty(products) &&
              has(products, "data") &&
              size(products.data) > 0 ? (
                renderProductCarousel()
              ) : (
                <Col>
                  <Empty
                    description={
                      <Title level={5}>You don't have any product</Title>
                    }
                  />
                </Col>
              )}
            </Row>
          </Col>
          <Col span={1} className="arrowCol absoluteRight">
            {haveRightBtn && (
              <RightOutlined
                className="arrowIconBtns"
                onClick={() => handleScroll("right")}
              />
            )}
          </Col>
        </Row>
        <Row justify="space-between" align="middle" className="px">
          <Col xs={2} sm={3} md={2}>
            {receiverPhoto && (
              <>
                <Avatar
                  size={isMobile ? 60 : isTab ? 70 : 80}
                  icon={<UserOutlined />}
                  src={`${siteConfig.imgUrl}${receiverPhoto}`}
                  className="relativeOnlineAvatar"
                />
                <div
                  className={
                    receiver?.recipient?.online === true
                      ? "shopOnlineIcon"
                      : null
                  }
                />
              </>
            )}
          </Col>
          <Col xs={18} sm={15} md={15}>
            <Row className="scrollableThumbs">
              {!isEmpty(cart) &&
                cart?.products &&
                cart.products.map((pro) => {
                  const imgSrc = `${siteConfig.imgUrl}${pro.product.images[0]?.image.path}`;
                  return (
                    <Col xs={8} md={3} key={pro.id}>
                      <div className="prodThumbContainer">
                        <CloseOutlined
                          onClick={() => updateProduct(pro.productId, 0)}
                          className="removeProdBtn"
                        />
                        <img src={imgSrc} className="prodThumbRound" />
                        <div>{pro.subtotal}</div>
                      </div>
                    </Col>
                  );
                })}
            </Row>
          </Col>
          <Col xs={24} sm={6} md={4} className="centerFlex">
            <Button
              type="primary"
              style={isMobile ? { marginTop: 10 } : {}}
              size={isMobile ? "middle" : "large"}
              className="bradius"
              onClick={() => {
                if (cart.total >= receiver.minOrderLimit) {
                  setCheckoutSwitch(true);
                } else {
                  message.info(
                    `Your order must be of atleast ${receiver.minOrderLimit} credits.`
                  );
                }
              }}
            >
              Go To Checkout
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  const renderCheckout = () => {
    return (
      <div className="checkoutModal noselect py">
        <Row>
          <Col flex="1" className="checkoutAvatarContainer px">
            <Button
              size={isMobile ? "small" : "middle"}
              className="keepShopingBtn"
              onClick={() => setCheckoutSwitch(false)}
            >
              Keep Shopping
            </Button>
            {receiverPhoto && (
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={`${siteConfig.imgUrl}${receiverPhoto}`}
              />
            )}
            <span className="recName">
              Your order for <span>{receiver?.recipient?.name || "-"}</span>
            </span>
          </Col>
        </Row>
        <Row
          className="checkoutListContainer px"
          justify="center"
          align="center"
        >
          <Col span={24}>
            {cart?.products && !isEmpty(cart.products) ? (
              cart.products.map((ci) => {
                const itemImage = ci.product.images[0].image.path;
                return (
                  <>
                    <Row
                      className="checkItemCard"
                      justify="space-between"
                      align="middle"
                    >
                      <Col xs={6} md={5}>
                        <Avatar
                          className="checkListItemImg"
                          shape="square"
                          src={`${siteConfig.imgUrl}${itemImage}`}
                        />
                      </Col>
                      <Col xs={18} md={14}>
                        <Row
                          className="checkItemNameText"
                          justify={isMobile && "end"}
                        >
                          {ci.product.name || "-"}
                        </Row>
                        <Row
                          className="checkItemNameText"
                          justify={isMobile && "end"}
                          align="middle"
                          style={{ marginTop: 10 }}
                        >
                          Qty
                          <Radio.Group
                            size={isMobile ? "small" : "middle"}
                            style={{ marginLeft: 10 }}
                            value={undefined}
                            options={[
                              {
                                label: "-",
                                value: "-",
                                disabled: ci.quantity === 1,
                              },
                              {
                                label: ci.quantity,
                                value: ci.quantity,
                                disabled: true,
                              },
                              {
                                label: "+",
                                value: "+",
                                disabled:
                                  ci.product.maxQuantity &&
                                  ci.quantity >= ci.product.maxQuantity,
                              },
                            ]}
                            onChange={(e) => {
                              if (e.target.value === "+")
                                updateProduct(ci.productId, ci.quantity + 1);
                              if (e.target.value === "-")
                                updateProduct(ci.productId, ci.quantity - 1);
                            }}
                            optionType="button"
                            buttonStyle="solid"
                          />
                        </Row>
                      </Col>
                      <Col xs={24} md={5} className="centerFlex-col">
                        <Row align="middle" style={{ width: "100%" }}>
                          <Col xs={12} md={24}>
                            <Row
                              justify={isMobile ? "start" : "center"}
                              align="middle"
                            >
                              {ci.subtotal} credits
                            </Row>
                          </Col>
                          <Col xs={12} md={24}>
                            <Row
                              justify={isMobile ? "end" : "center"}
                              align="middle"
                            >
                              <Button
                                style={{ marginTop: isMobile ? 0 : 5 }}
                                size={isMobile ? "small" : "middle"}
                                className="checkItemRemoveBtn"
                                icon={<DeleteOutlined />}
                                onClick={() => updateProduct(ci.productId, 0)}
                              >
                                Remove
                              </Button>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </>
                );
              })
            ) : (
              <>
                <Row justify="center" align="middle" className="py">
                  <Empty description="Your cart is empty!" />
                </Row>
              </>
            )}
          </Col>
        </Row>
        <Row align="center px pt">
          <Col flex="auto">
            <Form>
              <Form.Item
                validateStatus={noteValidation.validateStatus}
                help={noteValidation.errorMsg}
              >
                <Input.TextArea
                  className="messageArea"
                  placeholder="Type your message..."
                  autoSize={{ minRows: 4, maxRows: 4 }}
                  value={note}
                  onChange={(e) => {
                    let validationO = {
                      validateStatus: "success",
                      errorMsg: null,
                    };
                    if (e.target.value?.length >= 250) {
                      validationO = {
                        validateStatus: "error",
                        errorMsg:
                          "Maximum upto 500 characters are only allowed",
                      };
                    }
                    setNoteValidation({ ...validationO });
                    setNote(e.target.value);
                  }}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={24} sm={8} className="totalContaier">
            <span>
              Total: <span className="crText"> {cart.total} </span> credits
            </span>
            <Button
              style={{ marginTop: isMobile ? 10 : 0 }}
              disabled={cart && isEmpty(cart.products)}
              loading={btnLoading}
              type="primary"
              size="large"
              className="bradius"
              onClick={() => {
                if (cart.total >= receiver.minOrderLimit) {
                  noteValidation?.validateStatus !== "error" && palceOrder();
                } else {
                  message.info(
                    `Your order must be of atleast ${receiver.minOrderLimit} credits.`
                  );
                }
              }}
            >
              Place Order
            </Button>
          </Col>
        </Row>
        <Row className="px">
          <Text secondary>
            You can't cancel your order once it's confirmed, but you will be
            refunded in full in case the member can't receive your present. Your
            present will be delivered within 5 days and you will be notified
            once as soon as the member receives the delivery.
          </Text>
        </Row>
      </div>
    );
  };

  return (
    <>
      <Modal
        className={`shopModal ${checkoutSwitch ? "smallModal" : "largeModal"}`}
        visible={visible}
        footer={null}
        onCancel={() => dismiss()}
        zIndex={9}
        maskStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
          zIndex: 9,
        }}
      >
        {checkoutSwitch ? renderCheckout() : renderShop()}
      </Modal>
    </>
  );
}

Shop.defaultProps = {
  dismiss: () => {},
  visible: false,
  receiverId: null,
};

Shop.propTypes = {
  dismiss: PropTypes.func,
  visible: PropTypes.bool,
  receiverId: PropTypes.number,
};

export default Shop;
