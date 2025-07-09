
-- Create the tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Create the properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL
);

-- Create the maintenance_requests table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  issue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Scheduled', 'Escalated')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES maintenance_requests(id),
  message TEXT NOT NULL,
  sender TEXT NOT NULL, -- 'tenant' or 'agent'
  created_at TIMESTAMPTZ DEFAULT now()
);