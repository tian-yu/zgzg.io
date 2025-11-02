import React, { createContext, useState, useContext, useCallback } from 'react';

interface BoothContentContextType {
    contentCache: { [key: string]: string };
    fetchAndCacheContent: (filename: string) => Promise<string>;
    clearCache: () => void;
}

const BoothContentContext = createContext<BoothContentContextType | undefined>(undefined);

export const useBoothContent = () => {
    const context = useContext(BoothContentContext);
    if (!context) {
        throw new Error('useBoothContent must be used within a BoothContentProvider');
    }
    return context;
};

interface BoothContentProviderProps {
    children: React.ReactNode;
}

export const BoothContentProvider: React.FC<BoothContentProviderProps> = ({ children }) => {
    const [contentCache, setContentCache] = useState<{ [key: string]: string }>({});

    const fetchAndCacheContent = useCallback(async (filename: string): Promise<string> => {
        // Return cached content if available
        if (contentCache[filename]) {
            return contentCache[filename];
        }

        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to fetch HTML content');
            }
            const content = await response.text();

            // Cache the content
            setContentCache(prev => ({
                ...prev,
                [filename]: content
            }));

            return content;
        } catch (error) {
            console.error('Error fetching HTML content:', error);
            throw error;
        }
    }, [contentCache]);

    // Add a method to clear the cache if needed (e.g., for memory management)
    const clearCache = useCallback(() => {
        setContentCache({});
    }, []);

    const value = {
        contentCache,
        fetchAndCacheContent,
        clearCache
    };

    return (
        <BoothContentContext.Provider value={value}>
            {children}
        </BoothContentContext.Provider>
    );
};