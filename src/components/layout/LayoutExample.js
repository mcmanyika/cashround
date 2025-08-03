import React from 'react';
import Layout, { 
  LayoutCard, 
  LayoutHeader,
  LayoutLogo, 
  LayoutLogoText, 
  LayoutLogoBadge, 
  LayoutTitle, 
  LayoutSubtitle,
  LayoutLoading 
} from './Layout';

const LayoutExample = () => {
  return (
    <Layout>
      <LayoutCard>
        <LayoutHeader>
          <LayoutLogo>
            <LayoutLogoText>CR</LayoutLogoText>
            <LayoutLogoBadge>$</LayoutLogoBadge>
          </LayoutLogo>
          <LayoutTitle>Layout Example</LayoutTitle>
          <LayoutSubtitle>This demonstrates how to use the Layout components.</LayoutSubtitle>
        </LayoutHeader>
        
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#636e72', marginBottom: '20px' }}>
            The Layout components provide consistent styling and structure across the app.
          </p>
          
          <div style={{
            background: 'rgba(0, 184, 148, 0.1)',
            border: '1px solid rgba(0, 184, 148, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#2d3436', margin: '0 0 8px 0' }}>
              Available Components:
            </h3>
            <ul style={{ 
              textAlign: 'left', 
              color: '#636e72',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li>Layout - Main container with background</li>
              <li>LayoutCard - Content card with styling</li>
              <li>LayoutHeader - Header section</li>
              <li>LayoutLogo - Logo container</li>
              <li>LayoutTitle - Main title</li>
              <li>LayoutSubtitle - Subtitle text</li>
              <li>LayoutLoading - Loading spinner</li>
            </ul>
          </div>
          
          <button style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Example Button
          </button>
        </div>
      </LayoutCard>
    </Layout>
  );
};

export default LayoutExample; 