import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Check, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'layout' | 'color' | 'typography' | 'images' | 'spacing';
  text: string;
  tip: string;
}

export function AestheticsChecklist({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { aestheticsChecklistCompleted, setAestheticsChecklistCompleted } = useOfferStore();
  
  // Aesthetics checklist items
  const checklistItems: ChecklistItem[] = [
    // Layout
    {
      id: 'layout-1',
      category: 'layout',
      text: 'Use a clear visual hierarchy to guide attention',
      tip: 'The most important elements should be the most visually prominent. Use size, contrast, and positioning to create clear visual priorities.'
    },
    {
      id: 'layout-2',
      category: 'layout',
      text: 'Maintain a single primary call-to-action per section',
      tip: 'Too many competing CTAs can confuse visitors. Each section should guide toward one clear action.'
    },
    {
      id: 'layout-3',
      category: 'layout',
      text: 'Make sure the page is mobile-responsive',
      tip: 'Test your landing page on multiple devices to ensure it looks good and functions well on screens of all sizes.'
    },
    {
      id: 'layout-4',
      category: 'layout',
      text: 'Use a Z-pattern or F-pattern layout',
      tip: 'These patterns follow natural eye movement. Z-pattern works well for simple pages, while F-pattern is better for text-heavy content.'
    },
    
    // Color
    {
      id: 'color-1',
      category: 'color',
      text: 'Use a consistent, limited color palette',
      tip: 'Stick to 2-3 primary colors plus 1-2 accent colors. Too many colors create visual confusion.'
    },
    {
      id: 'color-2',
      category: 'color',
      text: 'Ensure sufficient contrast for text readability',
      tip: 'Text should stand out clearly against its background. Use tools like WebAIM Contrast Checker to verify.'
    },
    {
      id: 'color-3',
      category: 'color',
      text: 'Use color strategically to highlight key elements',
      tip: 'Reserve your brightest or most saturated colors for calls-to-action and important highlights.'
    },
    
    // Typography
    {
      id: 'typography-1',
      category: 'typography',
      text: 'Limit to 2-3 font families maximum',
      tip: 'Too many fonts create visual chaos. Use one font for headings and another for body text.'
    },
    {
      id: 'typography-2',
      category: 'typography',
      text: 'Use appropriate font sizes for readability',
      tip: 'Body text should be at least 16px. Headings should be proportionally larger based on their importance.'
    },
    {
      id: 'typography-3',
      category: 'typography',
      text: 'Maintain consistent text alignment',
      tip: 'Pick one alignment style (usually left-aligned) and use it consistently. Center alignment works well for short headings but not for body text.'
    },
    {
      id: 'typography-4',
      category: 'typography',
      text: 'Use proper line spacing (leading)',
      tip: 'Line height should be 1.5 to 2 times the font size for body text to improve readability.'
    },
    
    // Images
    {
      id: 'images-1',
      category: 'images',
      text: 'Use high-quality, relevant imagery',
      tip: 'Low-quality or generic stock photos can harm credibility. Use authentic images that support your message.'
    },
    {
      id: 'images-2',
      category: 'images',
      text: 'Optimize images for web performance',
      tip: 'Compress images to reduce page load time without sacrificing quality.'
    },
    {
      id: 'images-3',
      category: 'images',
      text: 'Include alt text for accessibility',
      tip: 'Alt text helps screen readers describe images to visually impaired users and improves SEO.'
    },
    
    // Spacing
    {
      id: 'spacing-1',
      category: 'spacing',
      text: 'Use consistent spacing throughout the page',
      tip: 'Create a spacing system with specific measurements and use them consistently throughout your design.'
    },
    {
      id: 'spacing-2',
      category: 'spacing',
      text: 'Add sufficient white space around important elements',
      tip: 'White space helps important elements stand out and makes the page feel less cluttered.'
    },
    {
      id: 'spacing-3',
      category: 'spacing',
      text: 'Group related elements together',
      tip: 'Use proximity to show which elements are related to each other. Related items should be closer together.'
    }
  ];
  
  // State to track which items are checked
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    aestheticsChecklistCompleted ? 
      // If the checklist is completed, mark all items as checked
      checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}) : 
      // Otherwise, start with an empty set
      {}
  );
  
  // Toggle check state of an item
  const toggleItem = (id: string) => {
    if (readOnly) return;
    
    const newCheckedItems = { 
      ...checkedItems, 
      [id]: !checkedItems[id] 
    };
    setCheckedItems(newCheckedItems);
    
    // If all items are checked, mark the checklist as completed
    const allChecked = checklistItems.every(item => newCheckedItems[item.id]);
    setAestheticsChecklistCompleted(allChecked);
  };
  
  // Check all items in a category
  const checkAllInCategory = (category: string) => {
    if (readOnly) return;
    
    const itemsInCategory = checklistItems.filter(item => item.category === category);
    const newCheckedItems = { ...checkedItems };
    
    itemsInCategory.forEach(item => {
      newCheckedItems[item.id] = true;
    });
    
    setCheckedItems(newCheckedItems);
    
    // Check if all items are now checked
    const allChecked = checklistItems.every(item => newCheckedItems[item.id]);
    setAestheticsChecklistCompleted(allChecked);
  };
  
  // Check all items
  const checkAll = () => {
    if (readOnly) return;
    
    const allChecked = checklistItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
    setCheckedItems(allChecked);
    setAestheticsChecklistCompleted(true);
  };
  
  // Clear all checks
  const clearAll = () => {
    if (readOnly) return;
    
    setCheckedItems({});
    setAestheticsChecklistCompleted(false);
  };
  
  // Count checked items
  const getCheckedCount = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    return Math.round((getCheckedCount() / checklistItems.length) * 100);
  };
  
  // Group items by category
  const groupedItems = checklistItems.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  // Category titles for display
  const categoryTitles: Record<string, string> = {
    layout: 'Layout & Structure',
    color: 'Color & Contrast',
    typography: 'Typography & Readability',
    images: 'Images & Media',
    spacing: 'Spacing & Whitespace'
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Landing Page Aesthetics Checklist</h2>
        <p className="text-gray-300 mb-6">
          Visual design plays a crucial role in conversion rates. Use this checklist to ensure your
          landing page follows best practices for aesthetics and user experience.
        </p>
        
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-white">Completion Status:</h3>
              <span className="ml-2 font-bold text-lg text-white">{getCompletionPercentage()}%</span>
            </div>
            <div className="mt-1 w-full bg-[#333333] rounded-full h-2.5">
              <div 
                className="bg-[#FFD23F] h-2.5 rounded-full" 
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex space-x-3">
              <button
                onClick={checkAll}
                className="px-3 py-1.5 bg-[#333333] text-white text-sm rounded hover:bg-[#444444]"
              >
                Mark All Complete
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-[#333333] text-white text-sm rounded hover:bg-[#444444]"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>
      
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="bg-[#222222] p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">
              {categoryTitles[category]}
            </h3>
            
            {!readOnly && (
              <button
                onClick={() => checkAllInCategory(category)}
                className="text-sm text-[#FFD23F] hover:underline"
              >
                Mark Section Complete
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`flex items-start p-3 rounded-lg ${
                  checkedItems[item.id] ? 'bg-[#1F2937] bg-opacity-40' : 'bg-[#1A1A1A]'
                }`}
              >
                <div 
                  onClick={() => toggleItem(item.id)}
                  className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded border ${
                    checkedItems[item.id]
                      ? 'bg-[#FFD23F] border-[#FFD23F] cursor-pointer'
                      : 'border-[#333333] cursor-pointer hover:border-[#FFD23F]'
                  } ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {checkedItems[item.id] && <Check className="w-4 h-4 text-[#1C1C1C]" />}
                </div>
                
                <div className="ml-3 flex-1">
                  <p 
                    className={`text-sm font-medium ${
                      checkedItems[item.id] ? 'text-gray-300 line-through' : 'text-white'
                    }`}
                  >
                    {item.text}
                  </p>
                  
                  <div className="mt-1 flex items-start text-xs text-gray-400">
                    <Info className="w-3 h-3 text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
                    <span>{item.tip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Completion Status</h3>
        
        <div>
          {getCompletionPercentage() === 100 ? (
            <div className="flex items-center p-4 bg-green-900 bg-opacity-25 border border-green-800 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <p className="text-white font-medium">All aesthetic checks complete!</p>
                <p className="text-gray-300 text-sm">Your landing page is following visual best practices.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-yellow-900 bg-opacity-25 border border-yellow-800 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-500 mr-3" />
              <div>
                <p className="text-white font-medium">Checklist incomplete</p>
                <p className="text-gray-300 text-sm">
                  {getCheckedCount()} of {checklistItems.length} items checked. 
                  Continue addressing the remaining items to ensure the best results.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 