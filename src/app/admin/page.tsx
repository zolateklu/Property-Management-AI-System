/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      // Get all maintenance requests with tenant and property details
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          tenant_id,
          property_id,
          issue,
          status,
          created_at,
          tenants!inner(name, phone),
          properties!inner(address)
        `)
        .order('created_at', { ascending: true }); // Get oldest first

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        console.log('Fetched requests:', data);
        
        // Filter to show only the first request per tenant-property combination
        const uniqueRequests = data?.reduce((acc: any[], current: any) => {
          const existingCombo = acc.find(req => 
            req.tenant_id === current.tenant_id && 
            req.property_id === current.property_id
          );
          
          // Only add if this tenant-property combination doesn't exist yet
          if (!existingCombo) {
            acc.push(current);
          }
          
          return acc;
        }, []) || [];
        
        // Sort by newest first for display
        uniqueRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setRequests(uniqueRequests);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <a 
                      href={`/admin/request/${request.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.tenants?.name || `Tenant ID: ${request.tenant_id}`}
                    </a>
                  </TableCell>
                  <TableCell>{request.tenants?.phone || `No phone data`}</TableCell>
                  <TableCell>{request.properties?.address || `Property ID: ${request.property_id}`}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.issue}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-sm ${
                      request.status === 'In Progress' 
                        ? 'bg-blue-100 text-blue-800' 
                        : request.status === 'Scheduled'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'Escalated'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
