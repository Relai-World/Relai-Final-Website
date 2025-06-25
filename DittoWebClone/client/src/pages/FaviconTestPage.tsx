import React, { useEffect } from 'react';

const FaviconTestPage: React.FC = () => {
  useEffect(() => {
    // This will change the favicon dynamically
    const link = document.querySelector("link[rel~='shortcut']") as HTMLLinkElement;
    if (link) {
      // Just updating the href with a new timestamp to force refresh
      link.href = `/favicon.ico?v=${Date.now()}`;
      console.log('Updated favicon link:', link.href);
    } else {
      console.log('Favicon link not found');
      
      // Create a new favicon link if it doesn't exist
      const newLink = document.createElement('link');
      newLink.rel = 'shortcut icon';
      newLink.href = `/favicon.ico?v=${Date.now()}`;
      document.head.appendChild(newLink);
      console.log('Created new favicon link:', newLink.href);
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Favicon Test Page</h1>
      <p className="mb-4">This page is testing the favicon functionality.</p>
      <p className="mb-4">If you see the new Relai favicon in your browser tab, the update was successful.</p>
      <p className="mb-4">Check the browser console for more information about what's happening with the favicon.</p>
      
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Debug Information:</h2>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        <p>Check the browser console for more details on the favicon loading process.</p>
      </div>
    </div>
  );
};

export default FaviconTestPage;