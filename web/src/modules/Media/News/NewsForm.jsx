import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  Switch, Upload, Image
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, UploadOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';

const { Option } = Select;
const { TextArea } = Input;

const NewsForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [tags, setTags] = useState([]);
  const isEditing = !!editingRecord;

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        title: editingRecord.title,
        content: editingRecord.content,
        category: editingRecord.category,
        author: editingRecord.author,
        source: editingRecord.source,
        news_date: editingRecord.news_date ? dayjs(editingRecord.news_date) : null,
        is_public: editingRecord.is_public !== undefined ? Boolean(editingRecord.is_public) : true,
        remarks: editingRecord.remarks,
      });
      
      setTags(editingRecord.tags || []);
      
      if (editingRecord.image_url) {
        setPreviewImage(editingRecord.image_url);
        setFileList([{
          uid: '-1',
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
      setTags([]);
      setFileList([]);
      setPreviewImage(null);
    }
  }, [editingRecord, form]);

  const handleSubmit = async (values) => {
    try {
      const selectedImage = fileList[0]?.originFileObj;

      const formData = {
        title: values.title,
        content: values.content,
        category: values.category || '',
        author: values.author || '',
        source: values.source || '',
        news_date: values.news_date ? values.news_date.format('YYYY-MM-DD') : '',
        is_public: values.is_public ? 1 : 0, // ✅ Send 1 or 0 for clean casting
        remarks: values.remarks || '',
        tags: tags,
      };

      if (selectedImage) {
        formData.image = selectedImage;
      }

      onSuccess(formData);
    } catch (error) {
      handleApiError(error, 'Failed to save news');
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setTags([]);
    setFileList([]);
    setPreviewImage(null);
    onCancel();
  };

  const handleTagAdd = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Modal
      title={isEditing ? 'Edit News' : 'Add News'}
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
          <Input placeholder="Enter news title" />
        </Form.Item>

        <Form.Item 
          name="content" 
          label="Content" 
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          <TextArea rows={5} placeholder="Enter news content" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                <Option value="Announcement">Announcement</Option>
                <Option value="Success Story">Success Story</Option>
                <Option value="Event">Event</Option>
                <Option value="Policy">Policy</Option>
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
            <Form.Item name="source" label="Source">
              <Input placeholder="Enter source" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="news_date" label="News Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Add tags (press Enter)"
                value={tags}
                onSelect={handleTagAdd}
                onDeselect={handleTagRemove}
                tokenSeparators={[',']}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_public" label="Public" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Image (Optional)" extra="Max size: 5MB">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="image/*"
            maxCount={1}
            listType="picture-card"
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
              {isEditing ? 'Update' : 'Create'}
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

export default NewsForm;