// Registry pentru iconuri din react-icons
// Suportă majoritatea librăriilor populare din react-icons

import * as Ai from "react-icons/ai";
import * as Bi from "react-icons/bi";
import * as Bs from "react-icons/bs";
import * as Cg from "react-icons/cg";
import * as Ci from "react-icons/ci";
import * as Di from "react-icons/di";
import * as Fa from "react-icons/fa";
import * as Fa6 from "react-icons/fa6";
import * as Fc from "react-icons/fc";
import * as Fi from "react-icons/fi";
import * as Gi from "react-icons/gi";
import * as Go from "react-icons/go";
import * as Gr from "react-icons/gr";
import * as Hi from "react-icons/hi";
import * as Hi2 from "react-icons/hi2";
import * as Im from "react-icons/im";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Lia from "react-icons/lia";
import * as Lu from "react-icons/lu";
import * as Md from "react-icons/md";
import * as Pi from "react-icons/pi";
import * as Ri from "react-icons/ri";
import * as Rx from "react-icons/rx";
import * as Si from "react-icons/si";
import * as Sl from "react-icons/sl";
import * as Tb from "react-icons/tb";
import * as Tfi from "react-icons/tfi";
import * as Ti from "react-icons/ti";
import * as Vsc from "react-icons/vsc";
import * as Wi from "react-icons/wi";

// Merge toate librăriile într-un singur registry
const iconRegistry = {
  ...Ai,
  ...Bi,
  ...Bs,
  ...Cg,
  ...Ci,
  ...Di,
  ...Fa,
  ...Fa6,
  ...Fc,
  ...Fi,
  ...Gi,
  ...Go,
  ...Gr,
  ...Hi,
  ...Hi2,
  ...Im,
  ...Io,
  ...Io5,
  ...Lia,
  ...Lu,
  ...Md,
  ...Pi,
  ...Ri,
  ...Rx,
  ...Si,
  ...Sl,
  ...Tb,
  ...Tfi,
  ...Ti,
  ...Vsc,
  ...Wi,
};

/**
 * Returnează componenta de icon din react-icons bazată pe nume
 * @param iconName - Numele iconului (ex: "AiFillAlipayCircle", "FaHeart", "GiMagicLamp")
 * @returns Componenta React pentru icon sau undefined dacă nu există
 */
export function getIconByName(
  iconName: string
): React.ComponentType<any> | undefined {
  return (iconRegistry as any)[iconName];
}

/**
 * Verifică dacă un icon există în registry
 * @param iconName - Numele iconului
 * @returns true dacă iconul există
 */
export function hasIcon(iconName: string): boolean {
  return iconName in iconRegistry;
}

export default iconRegistry;
