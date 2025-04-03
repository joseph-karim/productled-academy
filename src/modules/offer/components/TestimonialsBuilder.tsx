import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Plus, Trash2, MoveVertical, Sparkles, Loader2, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company?: string;
  role?: string;
  impact?: string;
}

export function TestimonialsBuilder({ modelData, readOnly = false }: { modelData?: any; readOnly?: boolean }) {
  const { 
    socialProof,
    addSocialProof,
    removeSocialProof,
    topResults,
    userSuccess,
    setProcessing
  } = useOfferStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [sectionTitle, setSectionTitle] = useState('What Our Customers Are Saying');
  const [sectionDescription, setSectionDescription] = useState('Don\'t take our word for it. Here\'s what our customers have experienced:');
  
  // Sync testimonials with store (more structured format locally, simple strings in store)
  React.useEffect(() => {
    // Parse stored testimonials if available
    if (socialProof.testimonials.length > 0 && testimonials.length === 0) {
      try {
        const parsedTestimonials = socialProof.testimonials.map(item => {
          try {
            return JSON.parse(item);
          } catch {
            // If it's not a JSON, create a simple testimonial object
            return {
              id: `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              quote: item,
              author: 'Happy Customer',
            };
          }
        });
        setTestimonials(parsedTestimonials);
      } catch (error) {
        console.error('Error parsing testimonials:', error);
      }
    }
  }, [socialProof.testimonials]);
  
  // Save testimonials to store
  const saveTestimonials = () => {
    // Remove old testimonials
    socialProof.testimonials.forEach((_, index) => {
      removeSocialProof('testimonials', 0); // Always remove first item
    });
    
    // Add new testimonials
    testimonials.forEach(testimonial => {
      addSocialProof('testimonials', JSON.stringify(testimonial));
    });
  };
  
  // Auto-save when testimonials change
  React.useEffect(() => {
    if (!readOnly && testimonials.length > 0) {
      saveTestimonials();
    }
  }, [testimonials]);
  
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      quote: '',
      author: '',
    };
    
    setTestimonials([...testimonials, newTestimonial]);
  };
  
  const updateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
    setTestimonials(
      testimonials.map(testimonial => 
        testimonial.id === id 
          ? { ...testimonial, [field]: value } 
          : testimonial
      )
    );
  };
  
  const removeTestimonial = (id: string) => {
    setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
  };
  
  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === testimonials.length - 1)
    ) {
      return;
    }
    
    const newTestimonials = [...testimonials];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newTestimonials[index], newTestimonials[targetIndex]] = 
      [newTestimonials[targetIndex], newTestimonials[index]];
    
    setTestimonials(newTestimonials);
  };
  
  const generateTestimonials = () => {
    setIsGenerating(true);
    setProcessing('socialProof', true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate based on previous data
      const generatedTestimonials: Testimonial[] = [];
      
      const companyNames = [
        'TechInnovate', 'GlobalSolutions', 'FutureFirm', 'SmartWorks', 
        'PeakPerformance', 'OptimizePro', 'NextLevel', 'StrategicSystems'
      ];
      
      const jobTitles = [
        'CEO', 'Marketing Director', 'Operations Manager', 'Team Lead',
        'Product Manager', 'Department Head', 'Project Manager', 'Business Owner'
      ];
      
      // Use user success and top results to generate relevant testimonials
      if (userSuccess.statement && topResults.tangible) {
        const successStatement = userSuccess.statement.toLowerCase();
        const tangibleResult = topResults.tangible.toLowerCase();
        const intangibleResult = topResults.intangible.toLowerCase();
        
        // First testimonial focused on tangible results
        generatedTestimonials.push({
          id: `testimonial-gen-1`,
          quote: `"Before we found this solution, we struggled with our ${successStatement}. Within just 3 months, we were able to ${tangibleResult}. The ROI has been incredible."`,
          author: `Alex Johnson`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Improved efficiency by 35%'
        });
        
        // Second testimonial focused on ease of use and implementation
        generatedTestimonials.push({
          id: `testimonial-gen-2`,
          quote: `"What impressed me most was how easy it was to get started. The onboarding was smooth, and our team was able to ${successStatement} almost immediately. Now we ${intangibleResult} every single day."`,
          author: `Sam Rodriguez`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Saved 10+ hours per week'
        });
        
        // Third testimonial focused on support and service
        generatedTestimonials.push({
          id: `testimonial-gen-3`,
          quote: `"Not only does the product deliver on its promises, but the support team has been exceptional. Any time we've had questions about how to best ${successStatement}, they've been there with timely, helpful guidance."`,
          author: `Jordan Smith`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Reduced costs by 22%'
        });
      } else {
        // Generic testimonials if no specific data available
        generatedTestimonials.push({
          id: `testimonial-gen-1`,
          quote: `"This solution has completely transformed how we operate. We've seen dramatic improvements in efficiency and our team is more productive than ever."`,
          author: `Alex Johnson`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Improved efficiency by 35%'
        });
        
        generatedTestimonials.push({
          id: `testimonial-gen-2`,
          quote: `"The implementation was seamless and the results were almost immediate. Our team picked it up quickly and we started seeing benefits within the first week."`,
          author: `Sam Rodriguez`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Saved 10+ hours per week'
        });
        
        generatedTestimonials.push({
          id: `testimonial-gen-3`,
          quote: `"Not only is the product excellent, but the support team has been outstanding. Any time we've needed help, they've been responsive and incredibly helpful."`,
          author: `Jordan Smith`,
          company: companyNames[Math.floor(Math.random() * companyNames.length)],
          role: jobTitles[Math.floor(Math.random() * jobTitles.length)],
          impact: 'Reduced costs by 22%'
        });
      }
      
      // Update section title and description
      setSectionTitle('Real Results from Real Customers');
      setSectionDescription('Don\'t just take our word for it. Here\'s what our customers have achieved:');
      
      // Update testimonials
      setTestimonials(generatedTestimonials);
      
      setIsGenerating(false);
      setProcessing('socialProof', false);
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Testimonials Builder</h2>
        <p className="text-gray-300 mb-4">
          Testimonials build credibility and trust with potential customers by showing real-world results.
          Focus on specific outcomes and benefits that customers have experienced.
        </p>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="mb-6">
          <button
            onClick={generateTestimonials}
            disabled={isGenerating || readOnly}
            className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Testimonials
              </>
            )}
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-300 mb-1">
              Section Title
            </label>
            <input
              id="sectionTitle"
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., What Our Customers Are Saying"
              className="w-full p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
          
          <div>
            <label htmlFor="sectionDescription" className="block text-sm font-medium text-gray-300 mb-1">
              Section Description
            </label>
            <textarea
              id="sectionDescription"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              disabled={readOnly}
              placeholder="e.g., Don't take our word for it. Here's what our customers have experienced:"
              className="w-full h-20 p-3 bg-[#1A1A1A] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Testimonials</h3>
          {!readOnly && (
            <button
              onClick={addTestimonial}
              className="flex items-center px-3 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Testimonial
            </button>
          )}
        </div>
        
        {testimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No testimonials added yet. Add your first testimonial or generate some automatically.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="bg-[#1A1A1A] p-5 rounded-lg">
                <div className="flex justify-between">
                  <div className="flex-1 pr-4">
                    <div className="mb-4">
                      <label htmlFor={`quote-${testimonial.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                        Testimonial Quote
                      </label>
                      <textarea
                        id={`quote-${testimonial.id}`}
                        value={testimonial.quote}
                        onChange={(e) => updateTestimonial(testimonial.id, 'quote', e.target.value)}
                        disabled={readOnly}
                        placeholder="e.g., This product has saved us hours every week and improved our productivity by 30%."
                        className="w-full h-24 p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`author-${testimonial.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Author Name
                        </label>
                        <input
                          id={`author-${testimonial.id}`}
                          type="text"
                          value={testimonial.author}
                          onChange={(e) => updateTestimonial(testimonial.id, 'author', e.target.value)}
                          disabled={readOnly}
                          placeholder="e.g., Jane Smith"
                          className="w-full p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`role-${testimonial.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Job Title (Optional)
                        </label>
                        <input
                          id={`role-${testimonial.id}`}
                          type="text"
                          value={testimonial.role || ''}
                          onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                          disabled={readOnly}
                          placeholder="e.g., Marketing Director"
                          className="w-full p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`company-${testimonial.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Company (Optional)
                        </label>
                        <input
                          id={`company-${testimonial.id}`}
                          type="text"
                          value={testimonial.company || ''}
                          onChange={(e) => updateTestimonial(testimonial.id, 'company', e.target.value)}
                          disabled={readOnly}
                          placeholder="e.g., Acme Inc."
                          className="w-full p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`impact-${testimonial.id}`} className="block text-sm font-medium text-gray-300 mb-1">
                          Impact/Result (Optional)
                        </label>
                        <input
                          id={`impact-${testimonial.id}`}
                          type="text"
                          value={testimonial.impact || ''}
                          onChange={(e) => updateTestimonial(testimonial.id, 'impact', e.target.value)}
                          disabled={readOnly}
                          placeholder="e.g., Increased sales by 40%"
                          className="w-full p-3 bg-[#111111] text-white border border-[#333333] rounded-lg placeholder-gray-500 focus:border-[#FFD23F] focus:outline-none disabled:opacity-70"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => moveTestimonial(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveVertical className="w-4 h-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveTestimonial(index, 'down')}
                        disabled={index === testimonials.length - 1}
                        className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Testimonials Section Preview</h3>
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-8 rounded-lg">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              {sectionTitle || "What Our Customers Are Saying"}
            </h2>
            <p className="text-lg text-gray-300">
              {sectionDescription || "Don't take our word for it. Here's what our customers have experienced:"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-[#1D1D1D] border border-[#333333] p-6 rounded-lg relative"
                >
                  <div className="absolute top-4 left-4 text-[#FFD23F]">
                    <Quote className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="pt-8">
                    <p className="text-gray-300 mb-6">
                      {testimonial.quote || "This product has been a game-changer for our business. We've seen incredible results."}
                    </p>
                    
                    <div>
                      <p className="font-medium text-white">
                        {testimonial.author || "Jane Smith"}
                        {testimonial.role && `, ${testimonial.role}`}
                      </p>
                      
                      {testimonial.company && (
                        <p className="text-gray-400 text-sm mt-1">{testimonial.company}</p>
                      )}
                      
                      {testimonial.impact && (
                        <p className="text-[#FFD23F] text-sm mt-3 font-medium">{testimonial.impact}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="bg-[#1D1D1D] border border-[#333333] p-6 rounded-lg relative"
                  >
                    <div className="absolute top-4 left-4 text-[#FFD23F] opacity-30">
                      <Quote className="w-8 h-8" />
                    </div>
                    <div className="pt-8">
                      <div className="h-24 bg-[#252525] rounded opacity-30 mb-6"></div>
                      <div className="h-6 w-32 bg-[#252525] rounded opacity-40"></div>
                      <div className="h-4 w-24 bg-[#252525] rounded opacity-30 mt-2"></div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[#222222] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Effective Testimonials</h3>
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Include Specific Results</h4>
            <p className="text-gray-300 text-sm">
              The most persuasive testimonials include specific, measurable results. "Increased conversions by 32%" is more powerful than "improved our business."
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Use Real People with Real Titles</h4>
            <p className="text-gray-300 text-sm">
              Including the person's name, job title, and company adds credibility. Get permission before using someone's testimonial.
            </p>
          </div>
          
          <div className="bg-[#1A1A1A] p-4 rounded-lg">
            <h4 className="text-white font-medium mb-2">Keep It Concise</h4>
            <p className="text-gray-300 text-sm">
              The most effective testimonials are brief and to the point. Aim for 2-3 sentences that focus on specific benefits or results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 