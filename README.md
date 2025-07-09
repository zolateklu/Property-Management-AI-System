# Property Management AI System

A comprehensive property management system that automates maintenance request handling through AI-powered workflows, featuring tenant communication via WhatsApp and intelligent request routing.

## 🏗️ System Architecture

This system combines a Next.js frontend with Supabase backend and n8n workflow automation to create an intelligent property management solution.

### Core Components
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Automation**: n8n workflow engine for AI-powered request handling
- **Communication**: Twilio WhatsApp integration for tenant messaging
- **UI Components**: shadcn/ui component library

## 🚀 Features

### 📝 Maintenance Request Management
- **Smart Form Validation**: Real-time validation with user-friendly error messages
- **Duplicate Prevention**: Automatically detects existing requests for same tenant/property
- **Conversation Tracking**: Additional submissions become conversations rather than duplicate requests
- **Status Management**: Three-tier status system (In Progress, Scheduled, Escalated)

### 🤖 AI-Powered Automation
- **Intelligent Routing**: n8n workflows automatically process and route requests
- **WhatsApp Integration**: Automated tenant communication via Twilio
- **Keyword Analysis**: AI analyzes tenant responses for appropriate routing
- **Escalation Logic**: Automatically escalates complex issues to human agents

### 👥 Admin Dashboard
- **Clean Overview**: Shows only first request per tenant-property combination
- **Detailed Views**: Full conversation history and request details
- **Status Tracking**: Visual status indicators with color-coded badges
- **Tenant Information**: Complete tenant and property details

### 💬 Conversational AI Workflow
1. **Initial Request**: Tenant submits maintenance request via form
2. **AI Response**: System sends WhatsApp message asking for clarification
3. **Tenant Reply**: Tenant provides additional details via WhatsApp
4. **Smart Processing**: AI analyzes response and determines next action
5. **Resolution**: Either schedules appointment or escalates to human

## 🗄️ Database Schema

### Tables Structure
```sql
-- Tenants: Store tenant information
tenants (id, name, phone)

-- Properties: Store property addresses
properties (id, address)

-- Maintenance Requests: Core request tracking
maintenance_requests (id, tenant_id, property_id, issue, status, created_at)

-- Conversations: Track all communications
conversations (id, request_id, message, sender, created_at)
```

### Status Values
- **In Progress**: Default status for new requests
- **Scheduled**: When appointment is confirmed
- **Escalated**: Complex issues requiring human intervention

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- n8n cloud account
- Twilio account with WhatsApp sandbox

### 1. Clone and Install
```bash
git clone <repository-url>
cd property-management-ai
npm install
```

### 2. Environment Configuration
Create `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# n8n Webhook URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

### 3. Database Setup
Run the schema in your Supabase SQL editor:
```bash
# Apply database schema
psql -f schema.sql

# If migrating from old status values
psql -f migration.sql
```

### 4. n8n Workflow Configuration
1. **Import workflow** to your n8n instance
2. **Configure Twilio credentials** for WhatsApp messaging
3. **Set up Supabase connections** for database operations
4. **Activate workflow** to enable webhook endpoints

### 5. Twilio WhatsApp Setup
1. **Configure WhatsApp sandbox** in Twilio console
2. **Set inbound webhook URL** to your n8n tenant reply endpoint
3. **Test WhatsApp integration** with sandbox number

## 🔧 Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Key Development Notes
- **Form Validation**: Real-time validation prevents invalid submissions
- **Loading States**: All async operations show proper loading indicators
- **Error Handling**: Graceful error handling without console logs
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 📱 User Flow

### For Tenants
1. **Submit Request**: Fill out maintenance request form with validation
2. **Receive WhatsApp**: Get automated message asking for clarification
3. **Provide Details**: Reply via WhatsApp with additional information
4. **Get Updates**: Receive appointment confirmations or escalation notices

### For Property Managers
1. **View Dashboard**: See all active maintenance requests
2. **Review Details**: Click requests to see full conversation history
3. **Track Status**: Monitor request progress with visual indicators
4. **Manage Escalations**: Handle complex issues requiring human intervention

## 🔄 Workflow Details

### n8n Automation Flow
```
Webhook Trigger → Find Tenant → Find Property → Log Request → 
Send WhatsApp → Wait for Reply → Analyze Keywords → 
Route Decision → Schedule/Escalate → Update Status
```

### Database Operations
- **Smart Deduplication**: Prevents multiple requests for same issue
- **Conversation Logging**: All interactions stored for audit trail
- **Status Tracking**: Automated status updates based on workflow progress

## 🎨 UI/UX Features

### Form Validation
- **Real-time feedback** with error messages
- **Visual indicators** (red borders for invalid fields)
- **Disabled states** prevent invalid submissions
- **Loading states** during form processing

### Admin Interface
- **Clean table view** with essential information
- **Color-coded status badges** for quick identification
- **Responsive design** works on all devices
- **Detailed drill-down** for complete request history

## 🔒 Security Features

- **Row Level Security** on all database tables
- **Input validation** and sanitization
- **Environment variable protection**
- **Webhook authentication** for n8n integration

## 📊 Monitoring & Analytics

### Available Data Points
- Request volume and trends
- Response times and resolution rates
- Tenant communication patterns
- Escalation frequency and reasons

### Conversation Tracking
- Complete audit trail of all interactions
- Tenant and agent message history
- Timestamp tracking for response times
- Status change logging

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Connect to Vercel
vercel

# Deploy with environment variables
vercel --prod
```

### Environment Variables for Production
Ensure all environment variables are properly configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation above
- Review the database schema and workflow diagrams
- Test the system with the provided examples
- Ensure all environment variables are properly configured

---

Built with ❤️ using Next.js, Supabase, n8n, and Twilio WhatsApp API.
