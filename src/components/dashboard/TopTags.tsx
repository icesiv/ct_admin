import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface TagsDetails {
  id: number;
  tag: string;
  view: number;
  news: number;
}

export default function TopTags() {
  const [tableData, setTableData] = useState<TagsDetails[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchTopTags = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ct-api.au/api/';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;

      try {
        // Fetch Trending Tags directly
        const trendingUrl = `${baseUrl}admin/trending-tags`;
        const trendingResponse = await authFetch(trendingUrl);
        const trendingResult = await trendingResponse.json();

        if (trendingResult.success && Array.isArray(trendingResult.data)) {
          setTableData(trendingResult.data);
        } else {
          console.error("Invalid trending tags data format", trendingResult);
          setTableData([]);
        }

      } catch (error: any) {
        console.error("Failed to fetch trending tags", error);
        setErrorMsg(`Fetch failed: ${error.message || "Unknown error"}`);
        setTableData([]);
      }
    };

    fetchTopTags();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Trending Topics
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tags
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Views
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                News
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.length > 0 ? (
              tableData.map((tags) => (
                <TableRow key={tags.id} className="">
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {tags.tag}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {tags.view}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {tags.news}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                  {errorMsg ? `Error: ${errorMsg}` : "No data available or loading..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
