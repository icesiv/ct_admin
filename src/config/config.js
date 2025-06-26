export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const availableCategories = [
    { id: 1, name: 'Technology', color: 'bg-blue-100 text-blue-800' },
    { id: 2, name: 'Business', color: 'bg-green-100 text-green-800' },
    { id: 3, name: 'Sports', color: 'bg-orange-100 text-orange-800' },
    { id: 4, name: 'Entertainment', color: 'bg-purple-100 text-purple-800' },
    { id: 5, name: 'Health', color: 'bg-red-100 text-red-800' },
    { id: 6, name: 'Science', color: 'bg-indigo-100 text-indigo-800' },
    { id: 7, name: 'Politics', color: 'bg-gray-100 text-gray-800' },
    { id: 8, name: 'Education', color: 'bg-yellow-100 text-yellow-800' },
    { id: 9, name: 'Travel', color: 'bg-teal-100 text-teal-800' },
    { id: 10, name: 'Food', color: 'bg-pink-100 text-pink-800' }
];

export const available_colors = availableCategories.map(c => {
    return c.color;
});  