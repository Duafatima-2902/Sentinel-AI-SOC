# SOC Security Dashboard MVP

A comprehensive Security Operations Center (SOC) dashboard built with React, Tailwind CSS, Node.js, and Express. This MVP demonstrates advanced security monitoring, case management, threat intelligence, and automated response capabilities.

## 🚀 Features

### Core Security Monitoring
- **Real-time Log Analysis**: Live monitoring of security logs with automatic categorization
- **KPI Dashboard**: Key performance indicators including logs, alerts, blocked IPs, and auto-patches
- **Threat Level Assessment**: Dynamic threat level calculation based on alert severity
- **Live Monitoring**: 24/7 monitoring with uptime tracking and daily resets

### Case Management (Tier 2 Workflow)
- **Alert Escalation**: Escalate alerts to create cases for detailed investigation
- **Case Tracking**: Track case status (Open, In Progress, Resolved)
- **Action Logging**: Complete audit trail of analyst actions
- **Case Resolution**: Close cases with resolution tracking

### Threat Intelligence Enrichment
- **IP Reputation**: Mock threat intelligence database with reputation scoring
- **Risk Assessment**: Risk scores (0-100) for all external IPs
- **Geographic Data**: Country and category information for threats
- **Real-time Enrichment**: Automatic threat intel lookup for new IPs

### Geo-Map Visualization 🌍
- **World Map**: Interactive map showing global threat distribution
- **Severity-based Markers**: Color-coded markers (Green=Low, Yellow=Medium, Orange=High, Red=Critical)
- **Animated Markers**: Pulsing animation for active threats
- **Threat Statistics**: Summary of threats by severity and geography

### Correlation Engine
- **Brute Force Detection**: Identifies >5 failed logins in 5 minutes from same IP
- **Multi-Vector Attacks**: Detects attacks across multiple categories from same IP
- **Port Scanning**: Identifies port scanning activity patterns
- **DDoS Detection**: Recognizes high-volume attack patterns

### Playbook Automation (SOAR-style)
- **Automated Response**: Pre-defined playbooks for common threats
- **Progress Tracking**: Real-time progress bars with step-by-step execution
- **Playbook Types**:
  - Block IP Address
  - Lock User Account
  - Isolate Host
- **Audit Trail**: Complete logging of playbook executions

### Report Generation
- **Incident Reports**: Generate comprehensive PDF reports
- **Executive Summary**: Key metrics and threat statistics
- **Top Malicious IPs**: Most active threat sources
- **Action Breakdown**: Manual vs Auto vs Playbook actions
- **Threat Categories**: Distribution of attack types

### Enhanced UI/UX
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly layout with adaptive grids
- **Smooth Animations**: Fade-in effects, count-up animations, and transitions
- **Tab Navigation**: Organized interface with Dashboard, Cases, and Map tabs

### Advanced Auto-Patching
- **Grace Period Timer**: 60-second countdown for manual intervention
- **Automatic Patching**: Auto-patch if analyst doesn't respond
- **Audit Logging**: Track patching method (Manual, Auto-Policy, Playbook)
- **Real-time Updates**: Live status updates via WebSocket

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Socket.IO Client**: Real-time communication with backend
- **Leaflet**: Interactive maps for geo-visualization
- **Recharts**: Data visualization for charts and graphs

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Socket.IO**: Real-time bidirectional communication
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soc-security-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the application**
   ```bash
   # Start both client and server concurrently
   npm run dev
   
   # Or start individually:
   npm run server  # Starts backend on port 5000
   npm run client  # Starts frontend on port 3000
   ```

## 🎯 Usage Guide

### Dashboard Tab
- **KPI Cards**: Monitor key security metrics in real-time
- **Charts**: View alert trends over the last 24 hours
- **Log Analysis**: Review recent security logs with threat intelligence
- **Auto-Patch Section**: Track automated security responses

### Cases Tab
1. **Create Cases**: Click "Escalate" on any High/Critical alert
2. **Manage Cases**: View case details, add actions, run playbooks
3. **Resolve Cases**: Mark cases as resolved when investigation is complete
4. **Track Progress**: Monitor case status and analyst actions

### Map Tab
- **Global View**: See worldwide threat distribution
- **Interactive Markers**: Click markers for detailed threat information
- **Legend**: Understand severity color coding
- **Statistics**: View threat counts by severity level

### Alert Management
1. **Alert Popup**: High/Critical alerts trigger modal with countdown timer
2. **Actions Available**:
   - **Patch Now**: Immediate manual patching
   - **Escalate**: Create case for investigation
   - **Ignore**: Dismiss alert (auto-patch after timer)
3. **Grace Period**: 60-second countdown before auto-patching

### Playbook Execution
1. **Run Playbooks**: Available in Cases tab and Alert modal
2. **Progress Tracking**: Real-time progress bars with step details
3. **Results**: Success/failure notifications with audit logging
4. **Automation**: Playbooks can be triggered automatically

### Report Generation
1. **Generate Report**: Click "Generate Report" button in header
2. **Download**: PDF report automatically downloads
3. **Content**: Includes metrics, top threats, and action summaries
4. **Scheduling**: Reports can be generated on-demand

## 🔧 Configuration

### Grace Period Timer
Modify the grace period in `server/index.js`:
```javascript
const GRACE_PERIOD_SECONDS = 60; // Change to desired seconds
```

### Correlation Rules
Add new correlation rules in `server/utils/correlationEngine.js`:
```javascript
{
  name: 'Custom Rule',
  condition: (ip, logs) => {
    // Your correlation logic here
    return conditionMet;
  },
  severity: 'High',
  category: 'Custom'
}
```

### Threat Intelligence
Add new threat intelligence data in `server/routes/enhanced.js`:
```javascript
const threatIntelDB = {
  'IP_ADDRESS': {
    reputation: 'Threat Description',
    riskScore: 85,
    country: 'Country',
    categories: ['Category1', 'Category2']
  }
};
```

## 📊 API Endpoints

### Core Endpoints
- `GET /api/logs` - Fetch security logs
- `GET /api/logs/stats` - Get log statistics
- `GET /api/patches` - Get auto-patch history
- `POST /api/logs` - Create new log entry

### Enhanced Endpoints
- `GET /api/threatintel/:ip` - Get threat intelligence for IP
- `POST /api/threatintel/bulk` - Bulk threat intelligence lookup
- `POST /api/playbook/:id/run` - Execute playbook
- `GET /api/playbook/:executionId/status` - Get playbook status
- `GET /api/report` - Generate incident report
- `GET /api/report/:reportId/download` - Download report PDF

### WebSocket Events
- `newLog` - New security log received
- `newAlert` - New alert triggered
- `autoPatchCompleted` - Auto-patch completed
- `playbookCompleted` - Playbook execution finished
- `correlatedAlert` - Correlation engine detected threat
- `gracePeriodStarted` - Grace period timer started
- `gracePeriodCancelled` - Grace period cancelled

## 🎨 Customization

### Color Scheme
Update severity colors in components:
```javascript
const severityColors = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};
```

### Dark Mode
All components support dark mode via the `darkMode` prop:
```javascript
<div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
```

### Responsive Design
Components use Tailwind's responsive classes:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client
npm run build

# Start production server
cd ..
npm start
```

### Environment Variables
Set production environment variables:
```env
NODE_ENV=production
PORT=5000
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd client && npm install && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   - Check if server is running on port 5000
   - Verify CORS settings in server configuration
   - Check firewall settings

2. **Map Not Loading**
   - Ensure Leaflet CSS is imported
   - Check internet connection for map tiles
   - Verify Leaflet installation

3. **Reports Not Generating**
   - Check server logs for errors
   - Verify API endpoint accessibility
   - Ensure proper file permissions

4. **Dark Mode Not Working**
   - Check if `darkMode` prop is passed to components
   - Verify Tailwind CSS classes are available
   - Check browser console for errors

### Debug Mode
Enable debug logging:
```javascript
// In server/index.js
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) console.log('Debug information');
```

## 📈 Performance Optimization

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large log lists
- Optimize re-renders with useMemo and useCallback
- Lazy load map components

### Backend
- Implement log pagination for large datasets
- Use Redis for session storage in production
- Implement rate limiting for API endpoints
- Add database connection pooling

## 🔒 Security Considerations

- Implement proper authentication and authorization
- Use HTTPS in production
- Sanitize all user inputs
- Implement rate limiting
- Regular security updates for dependencies
- Use environment variables for sensitive data

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Check server logs for error details

---

**Built with ❤️ for Security Operations Centers**