'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface InquiryContextType {
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <InquiryContext.Provider value={{ selectedService, setSelectedService }}>
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiryContext(): InquiryContextType {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiryContext must be used within an InquiryProvider');
  }
  return context;
}