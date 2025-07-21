import { useState, useEffect } from 'react';
import { Client } from '../types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const stored = localStorage.getItem('kef_clients');
    if (stored) {
      setClients(JSON.parse(stored));
    }
    setIsLoading(false);
  };

  const saveClients = (newClients: Client[]) => {
    localStorage.setItem('kef_clients', JSON.stringify(newClients));
    setClients(newClients);
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveClients([...clients, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updatedClients = clients.map(client =>
      client.id === id
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    );
    saveClients(updatedClients);
  };

  const deleteClient = (id: string) => {
    const filteredClients = clients.filter(client => client.id !== id);
    saveClients(filteredClients);
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
  };
};