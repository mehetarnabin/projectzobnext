import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminDashboard/AdminSidebar";
import AdminHeader from "../components/AdminDashboard/AdminHeader";
import SubscriptionModal from "../components/AdminDashboard/SubscriptionModal";
import SubscriptionGrid from "../components/AdminDashboard/SubscriptionGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import api from "../api/AdminApi"; // Axios instance with JWT

const EmployerSubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get("/subscription-plans");
      setPlans(res.data.data || []); // fallback to empty array
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      let res;
      if (editPlan) {
        res = await api.put(`/admin/subscription-plans/${editPlan.id}`, planData);
        setPlans(plans.map(p => p.id === editPlan.id ? res.data.data : p));
      } else {
        res = await api.post("/admin/subscription-plans", planData);
        setPlans([res.data.data, ...plans]);
      }
      setIsModalOpen(false);
      setEditPlan(null);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  const handleEditPlan = (plan) => {
    setEditPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (id) => {
    try {
      await api.delete(`/admin/subscription-plans/${id}`);
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-64 bg-gray-100"><AdminSidebar /></div>
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800">Employer Subscription Plans</h1>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#DC143C] hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> Add Plan
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <SubscriptionGrid plans={plans} onEdit={handleEditPlan} onDelete={handleDeletePlan} />
          </div>
        </main>

        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditPlan(null); }}
          onSave={handleSavePlan}
          editPlan={editPlan}
        />
      </div>
    </div>
  );
};

export default EmployerSubscriptionPage;
