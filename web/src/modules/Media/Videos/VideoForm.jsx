import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, DatePicker, Row, Col, Space, Button, 
  Switch, Upload, message, Image
} from 'antd';
import { 
  SaveOutlined, CloseOutlined, UploadOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleApiError } from '../../../utils/errorHandler';

const { Option } = Select;
const { TextArea } = Input;

const VideoForm = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
  isSubmitting,
}) => {
  const [form] = Form.useForm();
  const [videoFileList, setVideoFileList] = useState([]);
  const [thumbnailFileList, setThumbnailFileList] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [detectedDuration, setDetectedDuration] = useState('');
  const isEditing = !!editingRecord;

  // Helper to extract duration from video file
  const extractVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const totalSeconds = Math.round(video.duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formatted = hours > 0
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        resolve(formatted);
      };
      video.onerror = () => resolve('');
      video.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        title: editingRecord.title,
        description: editingRecord.description,
        category: editingRecord.category,
        location: editingRecord.location,
        duration: editingRecord.duration || '',
        recorded_date: editingRecord.recorded_date ? dayjs(editingRecord.recorded_date) : null,
        is_public: editingRecord.is_public !== undefined ? Boolean(editingRecord.is_public) : true,
        remarks: editingRecord.remarks,
      });
      setDetectedDuration(editingRecord.duration || '');
      setVideoFileList(editingRecord.video_path ? [{ uid: '-1', name: editingRecord.video_name || 'Video', status: 'done' }] : []);
      
      if (editingRecord.thumbnail_url) {
        setThumbnailPreview(editingRecord.thumbnail_url);
        setThumbnailFileList([{
          uid: '-2',
          url: editingRecord.thumbnail_url,
          name: 'thumbnail.jpg',
          status: 'done',
        }]);
      } else {
        setThumbnailFileList([]);
        setThumbnailPreview(null);
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        is_public: true,
      });
      setVideoFileList([]);
      setThumbnailFileList([]);
      setThumbnailPreview(null);
      setDetectedDuration('');
    }
  }, [editingRecord, form]);

  const handleVideoChange = async ({ fileList }) => {
    setVideoFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const dur = await extractVideoDuration(fileList[0].originFileObj);
      if (dur) {
        setDetectedDuration(dur);
        form.setFieldsValue({ duration: dur });
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const selectedVideo = videoFileList[0]?.originFileObj;
      const selectedThumbnail = thumbnailFileList[0]?.originFileObj;

      if (!isEditing && !selectedVideo) {
        message.error('Please select a video file to upload');
        return;
      }

      const formData = {
        title: values.title,
        description: values.description || '',
        category: values.category || '',
        location: values.location || '',
        duration: values.duration || detectedDuration || '00:00',
        recorded_date: values.recorded_date ? values.recorded_date.format('YYYY-MM-DD') : '',
        is_public: values.is_public ? 1 : 0,
        remarks: values.remarks || '',
      };

      if (selectedVideo) {
        formData.video = selectedVideo;
      }
      if (selectedThumbnail) {
        formData.thumbnail = selectedThumbnail;
      }

      onSuccess(formData);
    } catch (error) {
      handleApiError(error, 'Failed to save video');
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setVideoFileList([]);
    setThumbnailFileList([]);
    setThumbnailPreview(null);
    setDetectedDuration('');
    onCancel();
  };

  return (
    <Modal
      title={isEditing ? 'Edit Video' : 'Upload Video'}
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
          <Input placeholder="Enter video title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                <Option value="Training">Training</Option>
                <Option value="Demonstration">Demonstration</Option>
                <Option value="Event">Event</Option>
                <Option value="Documentary">Documentary</Option>
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
          <Col span={8}>
            <Form.Item name="duration" label="Duration (MM:SS)">
              <Input prefix={<ClockCircleOutlined />} placeholder="Auto-detected or enter e.g. 05:30" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="recorded_date" label="Recorded Date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_public" label="Public" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="Video File" 
          required={!isEditing}
          extra={isEditing ? 'Leave empty to keep existing video' : 'Max size: 50MB'}
        >
          <Upload
            beforeUpload={() => false}
            fileList={videoFileList}
            onChange={handleVideoChange}
            accept="video/*"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select Video</Button>
          </Upload>
        </Form.Item>

        <Form.Item 
          label="Thumbnail Image (Optional)"
          extra="Recommended size: 16:9 ratio, max 2MB"
        >
          <Upload
            beforeUpload={() => false}
            fileList={thumbnailFileList}
            onChange={({ fileList }) => setThumbnailFileList(fileList)}
            accept="image/*"
            maxCount={1}
            listType="picture-card"
          >
            {thumbnailFileList.length < 1 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {thumbnailPreview && !thumbnailFileList.length && (
          <div style={{ marginBottom: 16 }}>
            <Image 
              width={200} 
              src={thumbnailPreview} 
              alt="Current thumbnail" 
              style={{ borderRadius: 4 }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Current thumbnail</div>
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

export default VideoForm;