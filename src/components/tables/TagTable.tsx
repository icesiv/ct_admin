import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: number;
  topic: string;
  slug: string;
}

const demoTopics = [
  { id: 1, topic: "Technology", slug: "technology" },
  { id: 2, topic: "Sports", slug: "sports" },
  { id: 3, topic: "Politics", slug: "politics" },
  { id: 4, topic: "Entertainment", slug: "entertainment" },
  { id: 5, topic: "Business", slug: "business" },
  { id: 6, topic: "Health", slug: "health" },
  { id: 7, topic: "Science", slug: "science" },
  { id: 8, topic: "Education", slug: "education" },
  { id: 9, topic: "Travel", slug: "travel" },
  { id: 10, topic: "Food", slug: "food" },
  { id: 11, topic: "Fashion", slug: "fashion" },
  { id: 12, topic: "Gaming", slug: "gaming" },
  { id: 13, topic: "Music", slug: "music" },
  { id: 14, topic: "Movies", slug: "movies" },
  { id: 15, topic: "Books", slug: "books" },
];


export default function TagTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-4xl mx-auto overflow-x-auto ">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Topic
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Slug
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {demoTopics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="px-4 py-4 sm:px-6 text-center">
                  {topic.topic}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                  {topic.slug}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 space-x-4">
                  <button className="ml-2 text-green-500 hover:text-green-600">Edit</button>
                  <button className="text-red-500 hover:text-red-600">Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* <Pagination {...{ currentPage: 1, totalPages: 1, onPageChange: () => { } }} /> */}

    </div>
  );
}
