// web/src/components/common/FeedbackDrawer.jsx

import React, { useState } from 'react';
import { Modal, Form, Input, message, Typography, Tooltip } from 'antd';
import { mediaApi } from "../../services/api/mediaApi";
const { Text } = Typography;

export default function FeedbackModal() {
  const [visible, setVisible] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleIconClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    setVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleSubmit = async (values) => {
    setConfirmLoading(true);
    try {
      // 2. USE THE CONFIGURED API CLIENT
      await mediaApi.submitFeedback(values);
      message.success('Thank you! Your feedback has been successfully submitted.');
      form.resetFields();
      setVisible(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      message.error(error.response?.data?.message || 'Failed to submit feedback. Please try again later.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes treeGrowthCycle {
          0% { transform: scale(0.6) translateY(6px); opacity: 0.4; filter: brightness(0.8); }
          40% { transform: scale(1.0) translateY(0px); opacity: 1; filter: brightness(1); }
          80% { transform: scale(1.25) translateY(-4px); opacity: 1; filter: brightness(1.1); }
          100% { transform: scale(0.6) translateY(6px); opacity: 0.4; filter: brightness(0.8); }
        }
        .seed-tree-animated {
          animation: treeGrowthCycle 3s ease-in-out infinite;
          display: inline-block;
        }
        .green-tooltip .ant-tooltip-inner {
          color: #2C9647;
          background-color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 3px 6px rgba(0,0,0,0.15);
        }
        .green-tooltip .ant-tooltip-arrow::before {
          background-color: #FFFFFF !important;
        }
      `}</style>

      <Tooltip title="Send Feedback" placement="left" overlayClassName="green-tooltip">
        <div
          onClick={handleIconClick}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1050,
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: clicked ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid #2C9647',
            boxShadow: '0 4px 12px rgba(44, 150, 71, 0.2)',
          }}
        >
          <span className="seed-tree-animated" style={{ fontSize: 32, lineHeight: 1, userSelect: 'none' }}>
            🌾
          </span>
        </div>
      </Tooltip>

      <Modal
        title={
          <div style={{ fontFamily: "Georgia, serif", display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <span style={{ fontSize: 24 }}>🌾</span>
            <span>Share Your Feedback</span>
          </div>
        }
        open={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={450}
        destroyOnClose
        maskClosable={false}
        okText="Submit Feedback"
        style={{
          position: 'fixed',
          right: 24,
          top: 24,
          bottom: 24,
          margin: 0,
          maxWidth: 'calc(100vw - 48px)',
        }}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          }
        }}
        okButtonProps={{ 
          style: { backgroundColor: '#2C9647', borderColor: '#2C9647', height: 40, fontWeight: 600 } 
        }}
        cancelButtonProps={{ 
          style: { height: 40 } 
        }}
      >
        <div style={{ marginBottom: 24, marginTop: 8 }}>
          <Text type="secondary">
            We are constantly working to improve IAIMS. Your thoughts, suggestions, and bug reports are invaluable to us.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="subject"
            label={<span style={{ fontWeight: 600 }}>Feedback Subject</span>}
            rules={[{ required: true, message: 'Please provide a subject for your feedback.' }]}
          >
            <Input placeholder="e.g., Suggestion for FTC " size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 600 }}>Detailed Description</span>}
            rules={[{ required: true, message: 'Please describe your feedback in detail.' }]}
          >
            <Input.TextArea 
              rows={6} 
              placeholder="Describe the feature, issue, or experience you had..." 
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="user_email"
            label={<span style={{ fontWeight: 600 }}>Your Email</span>}
            rules={[{ type: 'email', message: 'Please enter a valid email address.' }]}
          >
            <Input placeholder="you@example.com" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}