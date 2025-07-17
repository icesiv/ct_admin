'use client';
import React, { useEffect, useState, DragEvent } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Save, X, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- TYPES --------------------------------------------------------------
interface MenuItem {
  id: number;
  label: string;
  slug: string;
  isExpanded?: boolean;
  children?: MenuItem[];
}

interface NewItemForm {
  label: string;
  slug: string;
  parentId: number | null;
}

interface CleanMenuItem {
  label: string;
  slug: string;
  children?: CleanMenuItem[];
}

// --- HELPERS ------------------------------------------------------------
const generateId = (): number => Math.floor(Math.random() * 10000);

// --- MAIN COMPONENT -----------------------------------------------------
const MenuBuilder: React.FC = () => {
  const { news_categories, user, loading, isAuthenticated, handleLogout, router, saveMenu, fetchMenu } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItemForm, setNewItemForm] = useState<NewItemForm>({ label: '', slug: '', parentId: null });
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // --- DRAG-AND-DROP STATE ----------------------------------------------
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<MenuItem | null>(null);

  // --- TREE UTILITIES ----------------------------------------------------
  const findParentAndIndex = (
    items: MenuItem[],
    id: number
  ): { parent: MenuItem[]; index: number } | null => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) return { parent: items, index: i };
      if (items[i].children) {
        const res = findParentAndIndex(items[i].children!, id);
        if (res) return res;
      }
    }
    return null;
  };

  const insertAt = (
    items: MenuItem[],
    parentId: number | null,
    item: MenuItem,
    targetIndex: number
  ): MenuItem[] => {
    if (parentId === null) {
      const clone = [...items];
      clone.splice(targetIndex, 0, item);
      return clone;
    }
    return items.map((it) => {
      if (it.id === parentId) {
        const children = [...(it.children || [])];
        children.splice(targetIndex, 0, item);
        return { ...it, children };
      }
      if (it.children) {
        return { ...it, children: insertAt(it.children, parentId, item, targetIndex) };
      }
      return it;
    });
  };

  const removeFromTree = (items: MenuItem[], id: number): { tree: MenuItem[]; removed: MenuItem | null } => {
    let removed: MenuItem | null = null;
    const tree = items.filter((it) => {
      if (it.id === id) {
        removed = it;
        return false;
      }
      if (it.children) {
        const res = removeFromTree(it.children, id);
        it.children = res.tree;
        if (res.removed) removed = res.removed;
      }
      return true;
    });
    return { tree, removed };
  };

  // --- DRAG HANDLERS -----------------------------------------------------
  const handleDragStart = (e: DragEvent<HTMLDivElement>, item: MenuItem) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, item: MenuItem) => {
    e.preventDefault();
    setDragOverItem(item);
  };

  const handleDragLeave = () => setDragOverItem(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>, target: MenuItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === target.id) {
      setDragOverItem(null);
      return;
    }

    // Find where dragged item is located
    const { tree: withoutDragged, removed } = removeFromTree(menuItems, draggedItem.id);
    if (!removed) return;

    // Find where to insert
    const targetLoc = findParentAndIndex(withoutDragged, target.id);
    if (!targetLoc) return;

    const newTree = insertAt(withoutDragged, targetLoc.parent === withoutDragged ? null : targetLoc.parent[0].id, removed, targetLoc.index + 1);
    setMenuItems(newTree);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // --- REST OF THE ORIGINAL LOGIC ----------------------------------------
  const toggleExpanded = (id: number): void => {
    setMenuItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isExpanded: !it.isExpanded } : it
      )
    );
  };

  const startEditing = (item: MenuItem): void => setEditingItem({ ...item });

  const saveEdit = (): void => {
    if (!editingItem) return;
    setMenuItems((prev) =>
      prev.map((it) =>
        it.id === editingItem.id
          ? { ...it, label: editingItem.label, slug: editingItem.slug }
          : it
      )
    );
    setEditingItem(null);
  };
  const cancelEdit = (): void => setEditingItem(null);

  const deleteItem = (id: number): void => {
    setMenuItems((prev) => {
      const { tree } = removeFromTree(prev, id);
      return tree;
    });
  };

  const addNewItem = (): void => {
    if (!newItemForm.label.trim()) return;
    const newItem: MenuItem = {
      id: generateId(),
      label: newItemForm.label,
      slug: newItemForm.slug,
      isExpanded: false,
      children: [],
    };
    setMenuItems((prev) =>
      newItemForm.parentId
        ? prev.map((it) =>
            it.id === newItemForm.parentId
              ? { ...it, children: [...(it.children || []), newItem] }
              : it
          )
        : [...prev, newItem]
    );
    setNewItemForm({ label: '', slug: '', parentId: null });
    setShowAddForm(false);
  };

  const exportMenuData = (): CleanMenuItem[] => {
    const clean = (item: MenuItem): CleanMenuItem => {
      const res: CleanMenuItem = { label: item.label, slug: item.slug };
      if (item.children?.length) res.children = item.children.map(clean);
      return res;
    };
    return menuItems.map(clean);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchMenu();
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    })();
  }, [fetchMenu]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user) return null;

  const reload = () => window.location.reload();

  // --- RENDER -----------------------------------------------------------
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isEditing = editingItem?.id === item.id;

    return (
      <div key={item.id} className="w-full">
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          className={`flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-grab
            ${dragOverItem?.id === item.id ? 'ring-2 ring-indigo-500' : ''}
            ${level > 0 ? 'ml-6' : ''}`}
          style={{ marginLeft: level * 24 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {item.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Label"
              />
              <input
                type="text"
                value={editingItem.slug}
                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Slug"
              />
              <button
                onClick={saveEdit}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <Save size={14} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.slug ? `/${item.slug}` : '<empty slug>'}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setNewItemForm({ ...newItemForm, parentId: item.id });
                    setShowAddForm(true);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                  title="Add submenu"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => startEditing(item)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {hasChildren && item.isExpanded && (
          <div className="ml-4">{item.children!.map((child) => renderMenuItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl hidden md:block font-semibold text-gray-800 dark:text-gray-100">Menu Structure</h2>
        <div className="flex gap-2">
          <button
            onClick={reload}
            className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-800 flex items-center gap-2 transition-colors"
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={async () => {
              try {
                await saveMenu({ name: 'main_navigation', menu: JSON.stringify(menuItems) });
              } catch (error) {
                console.error('Error saving menu:', error);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={() => {
              setNewItemForm({ label: '', slug: '', parentId: null });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">
            {newItemForm.parentId ? 'Add Submenu Item' : 'Add Main Menu Item'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Menu Label (e.g., ক্যাম্পাসের খবর)"
              value={newItemForm.label}
              onChange={(e) => setNewItemForm({ ...newItemForm, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Slug (e.g., campus-news)"
              value={newItemForm.slug}
              onChange={(e) => setNewItemForm({ ...newItemForm, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <button onClick={addNewItem} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemForm({ label: '', slug: '', parentId: null });
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">{menuItems.map((item) => renderMenuItem(item))}</div>

      {menuItems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No menu items yet. Add your first menu item or load sample data to get started!
        </div>
      )}
    </div>
  );
};

export default MenuBuilder;