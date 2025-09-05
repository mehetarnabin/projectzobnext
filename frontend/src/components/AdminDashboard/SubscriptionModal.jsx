// src/components/AdminDashboard/SubscriptionModal.jsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";

export function SubscriptionModal({ isOpen, onClose, onSave, editPlan }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    plan_type: "employer",
    name: "",
    price: "",
    description: "",
    features: {}, // key-value features
    recommended: false,
  });

  const [featureKey, setFeatureKey] = useState("");
  const [featureValue, setFeatureValue] = useState("");

  useEffect(() => {
    if (editPlan) {
      setFormData({
        ...editPlan,
        features: editPlan.features || {},
      });
    }
  }, [editPlan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Name and Price are required",
        variant: "destructive",
      });
      return;
    }
    onSave(formData);
    setFormData({
      plan_type: "employer",
      name: "",
      price: "",
      description: "",
      features: {},
      recommended: false,
    });
    setFeatureKey("");
    setFeatureValue("");
  };

  const addFeature = () => {
    if (!featureKey.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [featureKey.trim()]: featureValue || true }
    }));
    setFeatureKey("");
    setFeatureValue("");
  };

  const removeFeature = (key) => {
    const updated = { ...formData.features };
    delete updated[key];
    setFormData(prev => ({ ...prev, features: updated }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-3/4 max-w-[90vw] bg-white rounded-4xl shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#003893]">
            {editPlan ? "Edit Plan" : "Create New Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter plan name"
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />

            <Label htmlFor="price" className="mt-4">Price *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Enter price"
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />

            <Label htmlFor="description" className="mt-4">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="mt-1 w-full min-h-[100px] border-gray-200 rounded-4xl p-2"
            />
          </div>

          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Feature key (e.g. visibility)"
                value={featureKey}
                onChange={(e) => setFeatureKey(e.target.value)}
                className="flex-1 border-gray-200 rounded-4xl p-2"
              />
              <Input
                placeholder="Value (optional, default true)"
                value={featureValue}
                onChange={(e) => setFeatureValue(e.target.value)}
                className="flex-1 border-gray-200 rounded-4xl p-2"
              />
              <Button type="button" onClick={addFeature} size="sm">Add</Button>
            </div>

            {Object.keys(formData.features).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(formData.features).map(([key, value], i) => (
                  <div key={i} className="bg-gray-200 rounded-xl px-3 py-1 flex items-center gap-2">
                    {key}: {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeFeature(key)}>x</Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recommended}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommended: e.target.checked }))}
                  className="accent-[#003893]"
                />
                Recommended
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-[#003893] border-[#003893] rounded-4xl hover:bg-[#003893] hover:text-white">
              Cancel
            </Button>
            <Button type="submit" variant="outline" className="flex-1 text-[#003893] border-[#003893] rounded-4xl hover:bg-[#003893] hover:text-white">
              {editPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionModal;
