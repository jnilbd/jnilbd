import { createContext, useContext, useState, ReactNode } from "react";

type OpenMenu = "top" | "bottom" | null;

interface MenuCtx {
  openMenu: OpenMenu;
  setOpenMenu: (m: OpenMenu) => void;
  toggleMenu: (m: Exclude<OpenMenu, null>) => void;
}

const Ctx = createContext<MenuCtx | null>(null);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const toggleMenu = (m: Exclude<OpenMenu, null>) =>
    setOpenMenu((cur) => (cur === m ? null : m));
  return <Ctx.Provider value={{ openMenu, setOpenMenu, toggleMenu }}>{children}</Ctx.Provider>;
};

export const useMenu = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMenu must be inside MenuProvider");
  return v;
};
