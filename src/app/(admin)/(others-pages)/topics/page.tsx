import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TagTable from "@/components/tables/TagTable";

import { Metadata } from "next";
import React from "react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";

export const metadata: Metadata = {
  title: "Topics | CT Admin",
  description: "Topics Page CT Admin Dashboard",
};

export default function Topics() {


  return (
    <div>
      <PageBreadcrumb pageTitle="Topics" />

      {/* Add News To Lead */}
      <div className="rounded-2xl mb-8 md:border md:border-gray-200 md:bg-white md:px-4 py-6 md:dark:border-gray-800 md:dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <h3 className="mb-6 font-semibold text-center text-gray-800 dark:text-white/90 text-xl lg:text-2xl">
            Add Topic
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
                    placeholder="Enter Topic"
                  />
                </div>
                <div className="w-full">
                  <Label>
                    Slug
                  </Label>
                  <Input
                    type="text"
                    id="n_id"
                    name="n_id"
                    placeholder="Enter custom slug"
                  />
                </div>

                <button className="h-11 px-4 py-3 md:w-38 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

        <TagTable />
        
      
    </div>
  );
}