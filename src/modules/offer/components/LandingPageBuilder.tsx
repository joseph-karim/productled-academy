import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSectionBuilder } from './HeroSectionBuilder';
import { FeaturesSectionBuilder } from './FeaturesSectionBuilder';
import { CtaSectionBuilder } from './CtaSectionBuilder';
import { ArrowLeft, ArrowRight, Eye, Download, CheckCircle2 } from 'lucide-react';
import { useOfferStore } from '../store/offerStore';

export function LandingPageBuilder() {
  const [activeTab, setActiveTab] = useState("hero");
  const [previewMode, setPreviewMode] = useState(false);
  const {
    processingState,
    heroSection,
    featuresSection,
    ctaSection
  } = useOfferStore();

  // Helper to check if a section is complete
  const isSectionComplete = (section: string) => {
    switch (section) {
      case 'hero':
        return heroSection.tagline.length > 0 && heroSection.subCopy.length > 0 && heroSection.ctaText.length > 0;
      case 'features':
        return featuresSection?.features?.length > 0;
      case 'cta':
        return ctaSection.mainCtaText.length > 0 && (ctaSection.surroundingCopy?.length ?? 0) > 0;
      default:
        return false;
    }
  };

  // Navigate between tabs
  const goToNextTab = () => {
    if (activeTab === "hero") setActiveTab("features");
    else if (activeTab === "features") setActiveTab("cta");
    else if (activeTab === "cta") setActiveTab("preview");
  };

  const goToPrevTab = () => {
    if (activeTab === "features") setActiveTab("hero");
    else if (activeTab === "cta") setActiveTab("features");
    else if (activeTab === "preview") setActiveTab("cta");
  };

  // Export landing page
  const exportLandingPage = () => {
    // In a real implementation, this would generate the landing page HTML/CSS files
    // For this prototype, we'll just show an alert
    alert("Landing page export functionality would be implemented here in production");
  };

  const renderTabContent = (tabId: string) => {
    // If in preview mode, show read-only version
    const readOnly = activeTab === "preview";

    switch(tabId) {
      case "hero":
        return <HeroSectionBuilder readOnly={readOnly} />;
      case "features":
        return <FeaturesSectionBuilder readOnly={readOnly} />;
      case "cta":
        return <CtaSectionBuilder readOnly={readOnly} />;
      case "preview":
        return (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Landing Page Preview</h2>
              <p className="text-gray-300 mb-6">
                This is a preview of your landing page. You can go back to any section to make changes.
              </p>

              <div className="flex mb-6">
                <button
                  onClick={exportLandingPage}
                  className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Landing Page
                </button>
              </div>

              <div className="space-y-12 bg-[#111111] p-6 rounded-lg">
                <HeroSectionBuilder readOnly={true} />
                <FeaturesSectionBuilder readOnly={true} />
                <CtaSectionBuilder readOnly={true} />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Landing Page Builder</h1>
        <p className="text-gray-300 mt-2">
          Create a high-converting landing page for your offer. Follow the steps below to build each section.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid grid-cols-4 w-full h-auto p-1 bg-[#222222]">
          <TabsTrigger
            value="hero"
            className="data-[state=active]:bg-[#333333] data-[state=active]:text-white relative py-4"
          >
            <span className="flex flex-col items-center">
              <span>1. Hero Section</span>
              {isSectionComplete('hero') && (
                <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-2 right-2" />
              )}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="features"
            className="data-[state=active]:bg-[#333333] data-[state=active]:text-white relative py-4"
          >
            <span className="flex flex-col items-center">
              <span>2. Features</span>
              {isSectionComplete('features') && (
                <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-2 right-2" />
              )}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="cta"
            className="data-[state=active]:bg-[#333333] data-[state=active]:text-white relative py-4"
          >
            <span className="flex flex-col items-center">
              <span>3. Call-to-Action</span>
              {isSectionComplete('cta') && (
                <CheckCircle2 className="w-4 h-4 text-green-500 absolute top-2 right-2" />
              )}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-[#333333] data-[state=active]:text-white relative py-4"
          >
            <span className="flex flex-col items-center">
              <span>4. Preview</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {renderTabContent(activeTab)}

          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPrevTab}
              disabled={activeTab === "hero"}
              className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Section
            </button>

            <button
              onClick={goToNextTab}
              disabled={activeTab === "preview"}
              className="flex items-center px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
            >
              Next Section
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}