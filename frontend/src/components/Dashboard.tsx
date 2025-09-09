import React from 'react';
import Sidebar from './Sidebar'

const Dashboard: React.FC = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h1>Welcome to your dashboard!</h1>
      </div>
    </div>
  );
};

export default Dashboard;
