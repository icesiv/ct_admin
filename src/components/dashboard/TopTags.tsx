import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TagsDetails {
  id: number;
  tag: string;
  view: number;
  news: number;
  slug: string;
}

const tableData: TagsDetails[] = [
  {
    id: 1,
    tag: 'করোনাভাইরাস',
    view: 1200,
    news: 24,
    slug: '/coronavirus',
  },
  {
    id: 2,
    tag: 'ডেঙ্গু',
    view: 980,
    news: 18,
    slug: '/dengue',
  },
  {
    id: 3,
    tag: 'মধ্যপ্রাচ্য সংকট',
    view: 2500,
    news: 45,
    slug: '/middle-east-crisis',
  },
  {
    id: 4,
    tag: 'চাকরির খবর',
    view: 3200,
    news: 67,
    slug: '/job-news',
  },
  {
    id: 5,
    tag: 'আবহাওয়ার খবর',
    view: 1800,
    news: 32,
    slug: '/weather-news',
  },
  {
    id: 6,
    tag: 'অন্তর্বর্তী সরকার',
    view: 4500,
    news: 89,
    slug: '/interim-government',
  },
  {
    id: 7,
    tag: 'উপদেষ্টা',
    view: 2100,
    news: 41,
    slug: '/advisor',
  },
  {
    id: 8,
    tag: 'রিকশা',
    view: 750,
    news: 12,
    slug: '/rickshaw',
  },
  {
    id: 9,
    tag: 'বন্যা',
    view: 1650,
    news: 28,
    slug: '/flood',
  },
  {
    id: 10,
    tag: 'শিক্ষা',
    view: 2800,
    news: 56,
    slug: '/education',
  },
 
];

export default function TopTags() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Topics
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
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
                Slug
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
            {tableData.map((tags) => (
              <TableRow key={tags.id} className="">
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {tags.tag}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {tags.slug}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {tags.view}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {tags.news}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
