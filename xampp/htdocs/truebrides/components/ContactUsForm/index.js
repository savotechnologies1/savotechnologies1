import React, { useState } from "react";
import { Row, Col, Typography, Button, Modal, Input, Form } from "antd";
import fetchHelper from "@redux/utils/apiHelper";
import { Notify } from "@components";

function ContactUsForm(props) {
  const { visible, dismiss } = props;
  const [form] = Form.useForm();
  const [btnLoading, setBtnLoading] = useState(false);

  const { Text } = Typography;

  const handleSendContact = async (values) => {
    let url = `ContactMessages`;
    const data = {
      name: values.contact_name,
      email: values.contact_email,
      subject: values.contact_subject,
      message: values.contact_message,
    };
    setBtnLoading(true);
    try {
      const res = await fetchHelper(url, data, "POST");
      if (res) {
        Notify("success", "Success!", "Your message send");
        dismiss();
        form.resetFields();
      } else {
        Notify("error", "Oops!", "Something went wrong!");
      }
      setBtnLoading(false);
    } catch (error) {
      console.log(error);
      setBtnLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      footer={null}
      zIndex={10}
      closable={true}
      onCancel={() => {
        dismiss();
        form.resetFields();
      }}
      className="static_pages_modal"
      maskStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Row>
        <Col span={24}>
          <Text className="contact_title">Contact Us</Text>
          <Form
            form={form}
            name="contactForm"
            style={{ borderRadius: 10 }}
            onFinish={handleSendContact}
          >
            <Form.Item
              className="name_feild"
              name="contact_name"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid name",
                },
                {
                  max: 50,
                  message: "Maximum 50 characters are allowed",
                },
              ]}
            >
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item
              className="name_feild"
              name="contact_email"
              rules={[
                {
                  type: "email",
                  required: true,
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item
              className="name_feild"
              name="contact_subject"
              rules={[
                {
                  required: true,
                  message: "Please enter a valid subject",
                },
                {
                  max: 250,
                  message: "Maximum 250 characters are allowed",
                },
              ]}
            >
              <Input placeholder="Subject" />
            </Form.Item>
            <Form.Item
              className="name_feild"
              name="contact_message"
              rules={[
                {
                  required: true,
                  message: "Please enter a message",
                },
                {
                  max: 2000,
                  message: "Maximum 2000 characters are allowed",
                },
              ]}
            >
              <Input.TextArea placeholder="Message" rows={7} />
            </Form.Item>
            <Form.Item className="submit_item">
              <Button
                disabled={btnLoading}
                loading={btnLoading}
                className="contact_submit_btn"
                type="primary"
                htmlType="submit"
                block
                size="large"
              >
                SUBMIT
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
}

export default ContactUsForm;
