import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  Switch, Upload, message, Image
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, UploadOutlined, PictureOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';

const { Option } = Select;
const { TextArea } = Input;

const GalleryForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const isEditing = !!editingRecord;

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        title: editingRecord.title,
        description: editingRecord.description,
        category: editingRecord.category,
        location: editingRecord.location,
        captured_date: editingRecord.captured_date ? dayjs(editingRecord.captured_date) : null,
        is_public: editingRecord.is_public !== undefined ? editingRecord.is_public : true,
        remarks: editingRecord.remarks,
      });
      
      // Show existing image preview
      if (editingRecord.image_url) {
        setPreviewImage(editingRecord.image_url);
        setFileList([{
          url: editingRecord.image_url,
          name: editingRecord.image_name || 'image.jpg',
          status: 'done',
        }]);
      } else {
        setFileList([]);
        setPreviewImage(null);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_public: true,
      });
      setFileList([]);
      setPreviewImage(null);
    }
  }, [editingRecord, form]);

  const handleSubmit = async (values) => {
    try {
      const formData = {
        ...values,
        captured_date: values.captured_date?.format('YYYY-MM-DD'),
        image: values.image?.[0]?.originFileObj,
      };

      // Validate file is selected for new images
      if (!isEditing && !formData.image) {
        message.error('Please select an image file to upload');
        return;
      }

      onSuccess(formData);
    } catch (error) {
      handleApiError(error, 'Failed to save image');
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage(null);
    onCancel();
  };

  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl);
  };

  return (
    <Modal
      title={isEditing ? 'Edit Image' : 'Upload Image'}
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
          <Input placeholder="Enter image title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                <Option value="Farm">Farm</Option>
                <Option value="Crop">Crop</Option>
                <Option value="Livestock">Livestock</Option>
                <Option value="Event">Event</Option>
                <Option value="Training">Training</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="location" label="Location">
              <Input placeholder="Enter location" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="captured_date" label="Captured Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_public" label="Public" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" defaultChecked />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="image" 
          label="Image File" 
          rules={[{ required: !isEditing, message: 'Please upload an image' }]}
          extra={isEditing ? 'Leave empty to keep existing image' : 'Max size: 5MB'}
        >
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*"
            maxCount={1}
            listType="picture-card"
            onPreview={handlePreview}
          >
            {fileList.length < 1 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {previewImage && !fileList.length && (
          <div style={{ marginBottom: 16 }}>
            <Image 
              width={200} 
              src={previewImage} 
              alt="Current image" 
              style={{ borderRadius: 4 }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Current image</div>
          </div>
        )}

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

export default GalleryForm;