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

// --- MODAL COMPONENT ----------------------------------------------------
const AddItemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  newItemForm: NewItemForm;
  setNewItemForm: React.Dispatch<React.SetStateAction<NewItemForm>>;
  onAdd: () => void;
  parentItemLabel?: string;
}> = ({ isOpen, onClose, newItemForm, setNewItemForm, onAdd, parentItemLabel }) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-99999">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-4 text-lg">
          {newItemForm.parentId ? `Add Submenu Item to "${parentItemLabel}"` : 'Add Main Menu Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Menu Label
            </label>
            <input
              type="text"
              placeholder="e.g., ক্যাম্পাসের খবর"
              value={newItemForm.label}
              onChange={(e) => setNewItemForm({ ...newItemForm, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug
            </label>
            <input
              type="text"
              placeholder="e.g., campus-news"
              value={newItemForm.slug}
              onChange={(e) => setNewItemForm({ ...newItemForm, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Item
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT -----------------------------------------------------
const MenuBuilder: React.FC = () => {
  const { news_categories, user, loading, isAuthenticated, handleLogout, router, saveMenu, fetchMenu } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItemForm, setNewItemForm] = useState<NewItemForm>({ label: '', slug: '', parentId: null });
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // --- DRAG-AND-DROP STATE ----------------------------------------------
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<MenuItem | null>(null);

  // --- UNSAVED-CHANGES HANDLERS -----------------------------------------
  const updateMenuItems = (updater: React.SetStateAction<MenuItem[]>) => {
    setMenuItems(updater);
    setHasUnsavedChanges(true);
  };

  // Warn on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // required by Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  const isDescendant = (potentialParentId: number, potentialChildId: number, items: MenuItem[]): boolean => {
    const findItem = (list: MenuItem[]): MenuItem | undefined => {
      for (const item of list) {
        if (item.id === potentialChildId) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    const childItem = findItem(items);
    if (!childItem || !childItem.children) return false; // Child item not found or has no children

    const findInSubtree = (list: MenuItem[]): boolean => {
      for (const item of list) {
        if (item.id === potentialParentId) return true;
        if (item.children) {
          if (findInSubtree(item.children)) return true;
        }
      }
      return false;
    };

    return findInSubtree(childItem.children);
  };

  // --- HELPER TO FIND PARENT ITEM --------------------------------------- 
  const findParentItem = (items: MenuItem[], childId: number): MenuItem | null => {
    for (const item of items) {
      if (item.children) {
        // Check if childId is a direct child of this item
        if (item.children.some(child => child.id === childId)) {
          return item;
        }
        // Recursively search in children
        const found = findParentItem(item.children, childId);
        if (found) return found;
      }
    }
    return null;
  };

  // --- HELPER TO FIND ITEM BY ID ----------------------------------------
  const findItemById = (items: MenuItem[], id: number): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
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

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetItem: MenuItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDragOverItem(null);
      setDraggedItem(null);
      return;
    }

    if (isDescendant(targetItem.id, draggedItem.id, menuItems)) {
      console.warn("Cannot drag an item into its own descendant.");
      setDragOverItem(null);
      setDraggedItem(null);
      return;
    }

    // Simplified approach: Clone the tree and perform the move operation
    const newMenuItems = JSON.parse(JSON.stringify(menuItems)) as MenuItem[];
    
    // Remove the dragged item from its current position
    const { tree: treeWithoutDragged, removed: draggedItemRemoved } = removeFromTree(newMenuItems, draggedItem.id);
    if (!draggedItemRemoved) {
      console.error("Dragged item could not be removed.");
      setDragOverItem(null);
      setDraggedItem(null);
      return;
    }

    // Find where to insert the item
    const targetLocation = findParentAndIndex(treeWithoutDragged, targetItem.id);
    if (!targetLocation) {
      console.error("Target location not found.");
      setDragOverItem(null);
      setDraggedItem(null);
      return;
    }

    // Determine the parent ID for insertion
    let insertParentId: number | null = null;
    
    // Check if target is a child (has a parent that's not the root array)
    const targetParent = findParentItem(treeWithoutDragged, targetItem.id);
    if (targetParent) {
      // Target is a child, so insert as sibling
      insertParentId = targetParent.id;
    } else {
      // Target is a root item, so insert at root level
      insertParentId = null;
    }

    // Insert the dragged item after the target
    const insertIndex = targetLocation.index + 1;
    const finalTree = insertAt(treeWithoutDragged, insertParentId, draggedItemRemoved, insertIndex);
    
    updateMenuItems(finalTree);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // --- REST OF THE ORIGINAL LOGIC ----------------------------------------
  const toggleExpanded = (id: number): void => {
    updateMenuItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isExpanded: !it.isExpanded } : it
      )
    );
  };

  const startEditing = (item: MenuItem): void => setEditingItem({ ...item });

  const updateItemInTree = (items: MenuItem[], updatedItem: MenuItem): MenuItem[] => {
    return items.map((item) => {
      if (item.id === updatedItem.id) {
        return { ...item, label: updatedItem.label, slug: updatedItem.slug };
      }
      if (item.children) {
        return {
          ...item,
          children: updateItemInTree(item.children, updatedItem),
        };
      }
      return item;
    });
  };

  const saveEdit = (): void => {
    if (!editingItem) return;
    updateMenuItems((prevMenuItems) => updateItemInTree(prevMenuItems, editingItem));
    setEditingItem(null);
  };
 
  const cancelEdit = (): void => setEditingItem(null);

  const deleteItem = (id: number): void => {
    updateMenuItems((prev) => {
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
    updateMenuItems((prev) =>
      newItemForm.parentId
        ? prev.map((it) =>
          it.id === newItemForm.parentId
            ? { ...it, children: [...(it.children || []), newItem] }
            : it
        )
        : [...prev, newItem]
    );
    setNewItemForm({ label: '', slug: '', parentId: null });
    setShowAddModal(false);
  };

  const openAddModal = (parentId: number | null = null) => {
    setNewItemForm({ label: '', slug: '', parentId });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewItemForm({ label: '', slug: '', parentId: null });
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchMenu();
        setMenuItems(response.data);
        setHasUnsavedChanges(false); // fresh load
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
  const menuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isEditing = editingItem?.id === item.id;
    const isParentItem = level === 0; // Only top-level items are considered parent items
    const isDraggedOver = dragOverItem?.id === item.id;
    
    return (
      <>
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
            ${isDraggedOver ? 'ring-2 ring-indigo-500 ring-opacity-70 bg-indigo-50 dark:bg-indigo-900/20' : ''} 
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
          
          {/* Level indicator for better visual feedback */}
          {level > 0 && (
            <div className="w-1 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-2" />
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
                  {level > 0 && <span className="ml-2 text-xs">(submenu)</span>}
                </div>
              </div>
              <div className="flex gap-1">
                {/* Only show Add button for parent items (level 0) */}
                {isParentItem && (
                  <button
                    onClick={() => openAddModal(item.id)}
                    className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    title="Add submenu"
                  >
                    <Plus size={14} />
                  </button>
                )}
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
          <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {item.children!.map((child) => menuItem(child, level + 1))}
          </div>
        )}
      </div>
      </>
    );
  };

  // ---------- LOCAL HEADER COMPONENT ----------
  const MenuHeader: React.FC<{
    onReload: () => void;
    onSave: () => Promise<void>;
    onAdd: () => void;
  }> = ({ onReload, onSave, onAdd }) => (
    <div className="flex border-y py-2 border-gray-200 dark:border-gray-700 justify-end items-center flex-wrap gap-2">
      <div className="flex gap-2">
        <button
          onClick={onReload}
          className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-800 flex items-center gap-2 transition-colors"
        >
          <RefreshCcw size={20} />
        </button>
        <button
          onClick={async () => {
            try {
              await onSave();
              setHasUnsavedChanges(false); 
            } catch (error) {
              console.error('Error saving menu:', error);
            }
          }}
          disabled={!hasUnsavedChanges} 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
            hasUnsavedChanges
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200 dark:text-gray-400'
          }`}
        >
          <Save size={16} /> Save
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>
    </div>
  );

  const parentItemLabel = newItemForm.parentId ? findItemById(menuItems, newItemForm.parentId)?.label : undefined;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <MenuHeader
        onReload={reload}
        onSave={() => saveMenu({ name: 'main_navigation', menu: JSON.stringify(menuItems) })}
        onAdd={() => openAddModal()}
      />
      
      <AddItemModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        newItemForm={newItemForm}
        setNewItemForm={setNewItemForm}
        onAdd={addNewItem}
        parentItemLabel={parentItemLabel}
      />

      <div className="space-y-2">{menuItems.map((item) => menuItem(item))}</div>
      
      <MenuHeader
        onReload={reload}
        onSave={() => saveMenu({ name: 'main_navigation', menu: JSON.stringify(menuItems) })}
        onAdd={() => openAddModal()}
      />
      
      {menuItems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No menu items yet. Add your first menu item or load sample data to get started!
        </div>
    )}
    </div>
  );
};
export default MenuBuilder;