import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, X, Search } from 'lucide-react';

// Type definitions
interface Category {
    id: number;
    name: string;
}

interface MultiselectDropdownProps {
    news_categories: Category[];
    resetDropSelected: (categories: Category[]) => void;
    handleCategoryChange: (categories: Category[]) => void;
    preselected?: number[];
}

const MultiselectDropdown: React.FC<MultiselectDropdownProps> = ({
    news_categories,
    resetDropSelected,
    handleCategoryChange,
    preselected = []
}) => {
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter categories based on search term
    const filteredCategories = news_categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle category selection
    const handleCategoryToggle = (category: Category): void => {
        setSelectedCategories(prev => {
            const isSelected = prev.some(cat => cat.id === category.id);
            if (isSelected) {
                return prev.filter(cat => cat.id !== category.id);
            } else {
                return [...prev, category];
            }
        });
    };

    useEffect(() => {
        handleCategoryChange(selectedCategories);
    }, [selectedCategories]);

    // Remove specific category
    const removeCategory = (categoryId: number): void => {
        setSelectedCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    // Clear all selections
    const clearAll = (): void => {
        setSelectedCategories([]);
        resetDropSelected([]);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (preselected.length > 0 && selectedCategories.length === 0) {
            setSelectedCategories(news_categories.filter(cat => {
                return preselected.includes(cat.id);
            }));
        }
    }, [preselected, news_categories, selectedCategories.length]);

    // Get display text for dropdown button
    const getDisplayText = (): string => {
        if (selectedCategories.length === 0) {
            return 'Selected Categories : All';
        } else if (selectedCategories.length === 1) {
            return selectedCategories[0].name;
        } else if (selectedCategories.length === news_categories.length) {
            return 'Selected Categories : All';
        } else {
            return `Selected Categories : ${selectedCategories.length}`;
        }
    };

    return (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex flex-col lg:flex-row items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex justify-start grow" ref={dropdownRef}>
                    {/* Dropdown Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        // ToDO: FIX with
                        className="h-11 w-full max-w-md rounded-lg border px-4 py-2.5 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 0 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                    >
                        <div className="flex items-center justify-between ">
                            <span className="text-sm font-medium">{getDisplayText()}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute z-50 w-full max-w-md mt-12 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {/* Search Input */}
                            <div className="p-3 border-b border-gray-200 flex space-x-2">
                                <div className="relative grow">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Category ..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={clearAll}
                                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Clear
                                </button>
                            </div>

                            {/* Category List */}
                            <div className="max-h-60 overflow-y-auto">
                                {filteredCategories.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">
                                        Category Not Loaded
                                    </div>
                                ) : (
                                    filteredCategories.map((category) => {
                                        const isSelected = selectedCategories.some(cat => cat.id === category.id);
                                        return (
                                            <label
                                                key={category.id}
                                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        handleCategoryToggle(category);
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
                <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selectedCategories.map((category) => (
                            <span
                                key={category.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                                {category.name}
                                <button
                                    onClick={() => removeCategory(category.id)}
                                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors duration-200"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiselectDropdown;