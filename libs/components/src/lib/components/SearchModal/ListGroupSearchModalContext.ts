import { createContext } from 'react';

export const ListGroupSearchModalContext = createContext<{ itemRefs: Record<string, Element | null> } | null>(null);
