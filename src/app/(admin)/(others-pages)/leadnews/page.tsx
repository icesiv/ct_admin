import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import SortableNewsList from "@/components/lead-news/SortableNewsList";

export const metadata: Metadata = {
  title: "Lead News | CT Admin",
  description: "Lead News Page CT Admin Dashboard",
};

export default function LeadNews() {
  interface SmallButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }

  const SmallButton = ({ text, onClick, disabled = false, className = "" }: SmallButtonProps) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`h-11  border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm transition rounded-lg shadow-theme-xs hover:bg-brand-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {text}
      </button>
    )
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="LeadNews Page" />

      {/* Add News To Lead */}
      <div className="rounded-2xl md:border md:border-gray-200 md:bg-white md:px-4 py-6 md:dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <h3 className="mb-6 font-semibold text-center text-gray-800 dark:text-white/90 text-xl lg:text-2xl">
            Add a News To Lead Section
          </h3>

          <form>
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* News ID Section */}
              <div className="space-x-4 flex  flex-row justify-between items-end">
                <div className="w-full">
                  <Label>
                    News ID<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="n_id"
                    name="n_id"
                    placeholder="Enter News ID"
                  />
                </div>

                <SmallButton text="X" />
                <SmallButton text="Get" />
              </div>

              {/* News Title Section */}
              <div>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="News Title will be here"
                  disabled={true}
                />
              </div>

              <div className="flex space-x-4 items-end">
                <div className="w-full">
                  <Label>
                    Pick Order<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="order"
                    name="order"
                    defaultValue={1}
                    className="h-11 w-full text-center rounded-lg border py-2.5 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 0 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}

                <button className="h-11 px-4 py-3 md:w-38 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Set<span className="hidden md:inline"> Position</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Short Lead News */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <SortableNewsList />
      </div>

    </div>
  );
}