/* eslint-disable prefer-const */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function MaintenanceRequestForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [issue, setIssue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
    issue: ''
  });

  // Validation functions
  const validateName = (value: string) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return 'Phone number is required';
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value.trim())) return 'Please enter a valid phone number';
    return '';
  };

  const validateAddress = (value: string) => {
    if (!value.trim()) return 'Property address is required';
    if (value.trim().length < 5) return 'Please enter a complete address';
    return '';
  };

  const validateIssue = (value: string) => {
    if (!value.trim()) return 'Issue description is required';
    if (value.trim().length < 10) return 'Please provide more details about the issue (at least 10 characters)';
    return '';
  };

  // Real-time validation
  const handleNameChange = (value: string) => {
    setName(value);
    setErrors(prev => ({ ...prev, name: validateName(value) }));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setErrors(prev => ({ ...prev, address: validateAddress(value) }));
  };

  const handleIssueChange = (value: string) => {
    setIssue(value);
    setErrors(prev => ({ ...prev, issue: validateIssue(value) }));
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    const addressError = validateAddress(address);
    const issueError = validateIssue(issue);

    return !nameError && !phoneError && !addressError && !issueError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Validate all fields before submission
    const nameError = validateName(name);
    const phoneError = validatePhone(phone);
    const addressError = validateAddress(address);
    const issueError = validateIssue(issue);

    setErrors({
      name: nameError,
      phone: phoneError,
      address: addressError,
      issue: issueError
    });

    // Stop if validation fails
    if (nameError || phoneError || addressError || issueError) {
      return;
    }

    setIsLoading(true);
    
    try {
      // First, create or find the tenant
      let { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('phone', phone.trim())
        .single();

      if (tenantError && tenantError.code === 'PGRST116') {
        // Tenant doesn't exist, create new one
        const { data: newTenant, error: createTenantError } = await supabase
          .from('tenants')
          .insert([{ name: name.trim(), phone: phone.trim() }])
          .select('id')
          .single();
        
        if (createTenantError) {
          alert('Error creating tenant record');
          return;
        }
        tenant = newTenant;
      } else if (tenantError) {
        alert('Error finding tenant');
        return;
      }

      // Create or find the property
      let { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('address', address.trim())
        .single();

      if (propertyError && propertyError.code === 'PGRST116') {
        // Property doesn't exist, create new one
        const { data: newProperty, error: createPropertyError } = await supabase
          .from('properties')
          .insert([{ address: address.trim() }])
          .select('id')
          .single();
        
        if (createPropertyError) {
          alert('Error creating property record');
          return;
        }
        property = newProperty;
      } else if (propertyError) {
        alert('Error finding property');
        return;
      }

      // Check if maintenance request already exists for this tenant and property
      const { data: existingRequest, error: checkError } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('tenant_id', tenant?.id)
        .eq('property_id', property?.id)
        .in('status', ['In Progress', 'Scheduled'])
        .single();

      let maintenanceRequestId;

      if (checkError && checkError.code === 'PGRST116') {
        // No existing request, create new one
        const { data: maintenanceRequest, error } = await supabase
          .from('maintenance_requests')
          .insert([{
            tenant_id: tenant?.id,
            property_id: property?.id,
            issue: issue.trim()
          }])
          .select('id')
          .single();

        if (error) {
          alert('Error creating maintenance request');
          return;
        }
        maintenanceRequestId = maintenanceRequest.id;
      } else if (existingRequest) {
        // Use existing request and log this as a conversation
        maintenanceRequestId = existingRequest.id;
        
        // Log this submission as a conversation
        await supabase
          .from('conversations')
          .insert([{
            request_id: maintenanceRequestId,
            message: `Additional details: ${issue.trim()}`,
            sender: 'tenant'
          }]);
      } else {
        alert('Unexpected error checking for existing requests');
        return;
      }

      // Clear the form on success
      setName('');
      setPhone('');
      setAddress('');
      setIssue('');
      setErrors({ name: '', phone: '', address: '', issue: '' });

      // Trigger the n8n workflow via our API route
      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL && 
          process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL !== 'YOUR_N8N_WEBHOOK_URL') {
        try {
          const webhookResponse = await fetch('/api/webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name: name.trim(), 
              phone: phone.trim(), 
              address: address.trim(), 
              issue: issue.trim(),
              request_id: maintenanceRequestId,
              tenant_id: tenant?.id,
              property_id: property?.id
            }),
          });
          
          await webhookResponse.json();
          
          if (!webhookResponse.ok) {
            // Webhook failed but don't crash the form
            return;
          }
        } catch (webhookError) {
          // Don't fail the entire form submission if webhook fails
          console.error('Error triggering N8N webhook:', webhookError);
        }
      }
      
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
      console.error('Error submitting maintenance request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Submit a Maintenance Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Property Address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Textarea
                placeholder="Describe the issue in detail"
                value={issue}
                onChange={(e) => handleIssueChange(e.target.value)}
                className={errors.issue ? 'border-red-500' : ''}
                disabled={isLoading}
                rows={4}
              />
              {errors.issue && (
                <p className="text-red-500 text-sm mt-1">{errors.issue}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full cursor-pointer"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
