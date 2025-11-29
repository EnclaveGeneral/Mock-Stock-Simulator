import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';

function Dashboard() {
    return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: `${SIDEBAR_WIDTH}px`,
          minHeight: '100vh',
          backgroundColor: '#1c1d1e',
          padding: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
    );
}

export default Dashboard;