import React from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { apiGet } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  children: Category[];
}

interface ContactDetails {
  address: string;
  phone: string;
  email: string;
}

interface LayoutData {
  categories: Category[];
  contact_details: ContactDetails;
}

export const Layout: React.FC = () => {
  const { data: layoutData } = useQuery<LayoutData>({
    queryKey: ['layout'],
    queryFn: () => apiGet<LayoutData>('/layout/'),
  });

  const categories = layoutData?.categories || [];
  const contactDetails = layoutData?.contact_details || {
    address: "",
    phone: "",
    email: "",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer contactDetails={contactDetails} />
    </div>
  );
};
