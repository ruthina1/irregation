import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  Switch, Upload, message
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, UploadOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';

const { Option } = Select;
const { TextArea } = Input;

const DocumentForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const isEditing = !!editingRecord;

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        title: editingRecord.title,
        description: editingRecord.description,
        category: editingRecord.category,
        author: editingRecord.author,
        document_date: editingRecord.document_date ? dayjs(editingRecord.document_date) : null,
        is_public: editingRecord.is_public !== undefined ? Boolean(editingRecord.is_public) : true,
        remarks: editingRecord.remarks,
      });
      setFileList(editingRecord.file_path ? [{ uid: '-1', name: editingRecord.file_name || 'Document', status: 'done' }] : []);
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_public: true,
      });
      setFileList([]);
    }
  }, [editingRecord, form]);

  const handleSubmit = async (values) => {
    try {
      // ✅ Pull file directly from state fileList
      const selectedFile = fileList[0]?.originFileObj;

      // Validate file selection when creating a new document
      if (!isEditing && !selectedFile) {
        message.error('Please select a document file to upload');
        return;
      }

      const formData = {
        title: values.title,
        description: values.description || '',
        category: values.category || '',
        author: values.author || '',
        document_date: values.document_date ? values.document_date.format('YYYY-MM-DD') : '',
        is_public: values.is_public ? 1 : 0,
        remarks: values.remarks || '',
      };

      // Only attach document file if a new file was chosen
      if (selectedFile) {
        formData.document = selectedFile;
      }

      onSuccess(formData);
    } catch (error) {
      handleApiError(error, 'Failed to save document');
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Edit Document' : 'Upload Document'}
      open={visible}
      onCancel={handleModalCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item 
          name="title" 
          label="Title" 
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Enter document title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                <Option value="Policy">Policy</Option>
                <Option value="Report">Report</Option>
                <Option value="Manual">Manual</Option>
                <Option value="Guideline">Guideline</Option>
                <Option value="Form">Form</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="author" label="Author">
              <Input placeholder="Enter author name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="document_date" label="Document Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_public" label="Public" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="Document File" 
          required={!isEditing}
          extra={isEditing ? 'Leave empty to keep existing file' : 'Max size: 10MB'}
        >
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select Document</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="remarks" label="Remarks">
          <Input placeholder="Additional notes..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isSubmitting} 
              style={{ backgroundColor: '#1b7837' }}
              icon={<SaveOutlined />}
            >
              {isEditing ? 'Update' : 'Upload'}
            </Button>
            <Button onClick={handleModalCancel} icon={<CloseOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DocumentForm;