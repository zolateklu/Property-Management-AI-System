/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [request, setRequest] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select()
        .eq('id', resolvedParams.id)
        .single();

      if (error) {
        // Handle error silently
      } else {
        setRequest(data);
      }
    };

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select()
        .eq('request_id', resolvedParams.id)
        .order('created_at');

      if (error) {
        // Handle error silently
      } else {
        setConversations(data);
      }
    };

    fetchRequest();
    fetchConversations();
  }, [resolvedParams.id]);

  if (!request) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Tenant ID:</strong> {request.tenant_id}</p>
          <p><strong>Property ID:</strong> {request.property_id}</p>
          <p><strong>Issue:</strong> {request.issue}</p>
          <p><strong>Status:</strong> {request.status}</p>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div key={conversation.id}>
                <p><strong>{conversation.sender}:</strong> {conversation.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
