import React from 'react';

const TestComponent = () => {
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1>🎉 Fashion Hub Design Test</h1>
      <p>If you can see this, the components are working correctly!</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '15px',
        margin: '20px auto',
        maxWidth: '400px'
      }}>
        <h2>✨ Modern Design Features</h2>
        <ul style={{listStyle: 'none', padding: 0}}>
          <li>🎨 Beautiful Gradients</li>
          <li>🌟 Smooth Animations</li>
          <li>📱 Responsive Layout</li>
          <li>💫 Modern UI Elements</li>
        </ul>
      </div>
    </div>
  );
};

export default TestComponent;