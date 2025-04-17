import React from 'react';
import { LandingPageVariation } from '../services/ai/landingPageWireframeGenerator';

interface LandingPageVisualPreviewProps {
  variation: LandingPageVariation;
}

export function LandingPageVisualPreview({ variation }: LandingPageVisualPreviewProps) {
  // Extract colors from the visual style guide
  const {
    primary,
    secondary,
    accent,
    background,
    text
  } = variation.visualStyleGuide.colorPalette;

  // Helper function to create button styles
  const getButtonStyle = (isPrimary = true) => {
    return {
      backgroundColor: isPrimary ? primary : 'transparent',
      color: isPrimary ? (isLightColor(primary) ? '#000000' : '#FFFFFF') : primary,
      border: isPrimary ? 'none' : `2px solid ${primary}`,
      borderRadius: '6px',
      padding: '10px 20px',
      fontWeight: 'bold',
      cursor: 'pointer',
      display: 'inline-block',
      textAlign: 'center' as const,
      margin: '10px 0'
    };
  };

  // Helper function to determine if a color is light or dark
  const isLightColor = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  // Create section styles
  const sectionStyle = {
    padding: '60px 20px',
    backgroundColor: background,
    color: text,
    fontFamily: variation.visualStyleGuide.typography.body.includes('serif') ? 'serif' : 'sans-serif'
  };

  const headingStyle = {
    fontFamily: variation.visualStyleGuide.typography.headings.includes('serif') ? 'serif' : 'sans-serif',
    fontWeight: 'bold',
    color: text,
    marginBottom: '20px'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  return (
    <div style={{ backgroundColor: background, color: text, fontFamily: 'sans-serif' }}>
      {/* Hero Section */}
      <section style={{ ...sectionStyle, backgroundColor: secondary, paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{ ...headingStyle, fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '20px' }}>
              {variation.hero.headline}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#FFFFFF', opacity: 0.9, marginBottom: '30px', maxWidth: '800px' }}>
              {variation.hero.subheadline}
            </p>
            <div>
              <button style={getButtonStyle(true)}>
                {variation.hero.cta}
              </button>
            </div>
            <div style={{ marginTop: '40px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
              <p style={{ color: '#FFFFFF', opacity: 0.8, fontSize: '0.9rem' }}>
                <strong>Visual:</strong> {variation.hero.visualDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={{ ...headingStyle, fontSize: '2rem', textAlign: 'center' }}>
            {variation.problem.headline}
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {variation.problem.description.split('\\n\\n').map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section style={{ ...sectionStyle, backgroundColor: isLightColor(background) ? '#f8f8f8' : '#1a1a1a' }}>
        <div style={containerStyle}>
          <h2 style={{ ...headingStyle, fontSize: '2rem', textAlign: 'center' }}>
            {variation.solution.headline}
          </h2>
          <div style={{ maxWidth: '900px', margin: '40px auto 0' }}>
            {variation.solution.steps.map((step, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  marginBottom: '30px',
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: isLightColor(background) ? '#ffffff' : '#222222',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: primary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '20px',
                  color: isLightColor(primary) ? '#000000' : '#FFFFFF',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <div>
                  <h3 style={{ ...headingStyle, fontSize: '1.3rem', marginBottom: '10px' }}>
                    {step.title}
                  </h3>
                  <p style={{ lineHeight: '1.5' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Reversal Section */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            padding: '30px', 
            borderRadius: '8px',
            backgroundColor: isLightColor(background) ? '#ffffff' : '#222222',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ ...headingStyle, fontSize: '1.3rem' }}>
                Common Concern
              </h3>
              <p style={{ 
                padding: '15px', 
                borderRadius: '6px', 
                backgroundColor: isLightColor(background) ? '#f5f5f5' : '#1a1a1a',
                fontStyle: 'italic'
              }}>
                "{variation.riskReversal.objection}"
              </p>
            </div>
            <div>
              <h3 style={{ ...headingStyle, fontSize: '1.3rem' }}>
                Our Guarantee
              </h3>
              <p style={{ lineHeight: '1.6' }}>
                {variation.riskReversal.assurance}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ ...sectionStyle, backgroundColor: secondary, paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ ...headingStyle, fontSize: '2.2rem', color: '#FFFFFF', marginBottom: '20px' }}>
              {variation.cta.headline}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#FFFFFF', opacity: 0.9, marginBottom: '30px' }}>
              {variation.cta.description}
            </p>
            <button style={getButtonStyle(true)}>
              {variation.cta.buttonText}
            </button>
          </div>
        </div>
      </section>

      {/* Visual Style Guide Preview */}
      <section style={{ ...sectionStyle, backgroundColor: '#000000', color: '#FFFFFF', paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={containerStyle}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>
            Visual Style Guide
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#111111', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Color Palette</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(variation.visualStyleGuide.colorPalette).map(([name, color]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: color, 
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span style={{ fontSize: '0.9rem' }}>{name}: {color}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#111111', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Typography</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <p>Headings: {variation.visualStyleGuide.typography.headings}</p>
                <p>Body: {variation.visualStyleGuide.typography.body}</p>
              </div>
            </div>
            <div style={{ padding: '15px', backgroundColor: '#111111', borderRadius: '8px', minWidth: '200px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Spacing & Imagery</h4>
              <div style={{ fontSize: '0.9rem' }}>
                <p>Spacing: {variation.visualStyleGuide.spacing}</p>
                <p>Imagery: {variation.visualStyleGuide.imagery}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
