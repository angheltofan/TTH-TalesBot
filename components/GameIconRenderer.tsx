import React from "react";
import { getIconByName } from "../icon-registry";

interface GameIconRendererProps {
  iconName: string;
  className?: string;
  size?: number;
}

/**
 * Componentă care renderează dinamic iconuri din react-icons
 * bazate pe numele primit ca string
 */
export default function GameIconRenderer({
  iconName,
  className = "",
  size,
}: GameIconRendererProps) {
  const IconComponent = getIconByName(iconName);

  if (!IconComponent) {
    // Fallback la un icon generic dacă nu găsește iconul specificat
    console.warn(`[GameIconRenderer] Icon "${iconName}" not found in registry`);
    const FallbackIcon = getIconByName("BsQuestionCircle");
    if (FallbackIcon) {
      return <FallbackIcon className={className} size={size} />;
    }
    return (
      <div className={`${className} flex items-center justify-center`}>?</div>
    );
  }

  return <IconComponent className={className} size={size} />;
}
