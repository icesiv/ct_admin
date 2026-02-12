import TagList from "@/components/tags/TagList";

export const metadata = {
  title: "Manage Topics | Campus Times Admin",
  description: "Manage topics and tags",
};

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">All Topics</h1>
      </div>
      <TagList />
    </div>
  );
}