"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { clinics } from "./data";
import type { Clinic } from "./types";

interface ClinicContextType {
  currentClinic: Clinic;
  setCurrentClinic: (clinic: Clinic) => void;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

const defaultClinic = clinics.find((c) => c.id === "cl-001")!;

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [currentClinic, setCurrentClinic] = useState<Clinic>(defaultClinic);
  return (
    <ClinicContext.Provider value={{ currentClinic, setCurrentClinic }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
