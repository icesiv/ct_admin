"use client";
import React, { useEffect, useState } from 'react';
import { LocationService } from '@/services/LocationService';
import { Division, District } from '@/types/location';
import { X, MapPin, Plus } from 'lucide-react';

interface LocationSelectorProps {
    selectedDistrictIds: number[];
    onChange: (ids: number[]) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ selectedDistrictIds, onChange }) => {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");

    const [allKnownDistricts, setAllKnownDistricts] = useState<District[]>([]);

    useEffect(() => {
        // Load divisions on mount
        const loadDivisions = async () => {
            try {
                const data = await LocationService.getDivisions();
                setDivisions(data);
            } catch (error) {
                console.error("Failed to load divisions", error);
            }
        };
        loadDivisions();

        const loadAllDistricts = async () => {
            try {
                const data = await LocationService.getDistricts();
                setAllKnownDistricts(data);
            } catch (error) {
                console.error("Failed to load all districts", error);
            }
        }
        loadAllDistricts();

    }, []);

    useEffect(() => {
        if (selectedDivisionId) {
            const loadDistricts = async () => {
                const data = await LocationService.getDistricts(Number(selectedDivisionId));
                setDistricts(data);
            };
            loadDistricts();
            setSelectedDistrictId(""); // Reset district when division changes
        } else {
            setDistricts([]);
            setSelectedDistrictId("");
        }
    }, [selectedDivisionId]);

    const handleAddLocation = () => {
        if (!selectedDistrictId) return;
        const id = Number(selectedDistrictId);

        if (!selectedDistrictIds.includes(id)) {
            onChange([...selectedDistrictIds, id]);
        }

        // Reset selection
        setSelectedDistrictId("");
    };

    const handleRemoveLocation = (id: number) => {
        onChange(selectedDistrictIds.filter(dId => dId !== id));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm w-full">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium text-gray-900">Location</h3>
            </div>

            <div className="space-y-4">
                {/* Selection Controls */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Division</label>
                        <select
                            value={selectedDivisionId}
                            onChange={(e) => setSelectedDivisionId(e.target.value)}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Division</option>
                            {divisions.map(div => (
                                <option key={div.id} value={div.id}>{div.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">District</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedDistrictId}
                                onChange={(e) => setSelectedDistrictId(e.target.value)}
                                disabled={!selectedDivisionId}
                                className="flex-1 w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                            >
                                <option value="">Select District</option>
                                {districts.map(dist => (
                                    <option key={dist.id} value={dist.id}>{dist.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddLocation}
                                disabled={!selectedDistrictId}
                                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selected List */}
                {selectedDistrictIds.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-500 mb-2">Selected Locations:</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedDistrictIds.map(id => {
                                const district = allKnownDistricts.find(d => d.id === id);
                                return (
                                    <span
                                        key={id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                        {district ? district.name : `ID: ${id}`}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLocation(id)}
                                            className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationSelector;
