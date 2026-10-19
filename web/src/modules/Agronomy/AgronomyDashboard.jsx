import React, { useState, useEffect } from 'react';
import { Tabs, Card, message, Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import LandParcelForm from './LandParcelForm';
import SeasonalCropForm from './CropProduction';
import SeedMultiplicationForm from './SeedMultiplicationForm';
import PestReportForm from './PestReportForm';
import PestSurveillanceGrid from './PestSurveillanceGrid';
import agronomyApi from "../../services/api/agronomyApi";

const { Title } = Typography;

const AgronomyDashboard = () => {
  const [activeTab, setActiveTab] = useState('parcels');
  const [loading, setLoading] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchLandParcels();
  }, []);

  const fetchLandParcels = async () => {
    try {
      setLoading(true);
      const response = await agronomyApi.getLandParcels();
      setParcels(response.data.data);
    } catch (error) {
      message.error('Failed to fetch land parcels');
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentTab = () => {
    setRefreshTrigger(prev => prev + 1);
    message.success('Data refreshed');
  };

  const handleParcelCreated = (newParcel) => {
    setParcels(prev => [newParcel, ...prev]);
    setSelectedParcelId(newParcel.id);
    message.success('Land parcel created successfully');
    setActiveTab('crops');
  };

  const tabItems = [
    {
      key: 'parcels',
      label: 'Land Parcels & Soil Profiling',
      children: (
        <Card>
          <LandParcelForm onSuccess={handleParcelCreated} />
        </Card>
      ),
    },
    {
      key: 'crops',
      label: 'Seasonal Crop Production',
      children: (
        <Card>
          <SeasonalCropForm 
            parcels={parcels} 
            selectedParcelId={selectedParcelId}
            onSuccess={() => setRefreshTrigger(prev => prev + 1)}
          />
        </Card>
      ),
    },
    {
      key: 'seeds',
      label: 'Seed Multiplications',
      children: (
        <Card>
          <SeedMultiplicationForm parcels={parcels} />
        </Card>
      ),
    },
    {
      key: 'pests',
      label: 'Pest Surveillance',
      children: (
        <div className="space-y-6">
          <Card title="New Pest Report">
            <PestReportForm parcels={parcels} />
          </Card>
          <Card 
            title="Active Surveillance Grid" 
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshCurrentTab}
              >
                Refresh
              </Button>
            }
          >
            <PestSurveillanceGrid refreshTrigger={refreshTrigger} />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="!mb-2">
            Agronomy, Horticulture & Protection Management
          </Title>
          <p className="text-gray-600">
            Manage land parcels, crop production, seed multiplication, and pest surveillance
          </p>
        </div>
        
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
          size="large"
        />
      </div>
    </div>
  );
};

export default AgronomyDashboard;