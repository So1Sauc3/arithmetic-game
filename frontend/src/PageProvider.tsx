import React, { createContext, useContext, useState } from "react";

export const enum CurrentPage {
  Login,
  Lobby,
  Game,
}

type PageContextType = {
  page: CurrentPage;
  setPage: React.Dispatch<React.SetStateAction<CurrentPage>>;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState(CurrentPage.Game);
  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePage must be used within PageProvider");
  return ctx;
}
