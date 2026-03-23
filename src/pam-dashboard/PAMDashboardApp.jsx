import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/layout.css';
import Dashboard from './Dashboard';

export default function PAMDashboardApp() {
  return (
    <div className="app-root pam-dashboard-root">
      <div className="container-fluid">
        <Dashboard />
      </div>
    </div>
  );
}
