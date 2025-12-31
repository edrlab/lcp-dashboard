import { 
  Book, 
  FileText, 
  Headphones, 
  Image, 
  CheckCircle, 
  Play, 
  Clock, 
  Ban, 
  XCircle,
  LucideIcon 
} from "lucide-react";

// Configuration des types de publications avec leurs icônes et couleurs
export const publicationTypeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  EPUB: { icon: Book, color: "bg-chart-primary" },
  PDF: { icon: FileText, color: "bg-chart-secondary" },
  Audiobooks: { icon: Headphones, color: "bg-success" },
  Comics: { icon: Image, color: "bg-warning" },
};

// Configuration des statuts de licences avec leurs icônes et couleurs
export const licenseStatusConfig: Record<string, { icon: LucideIcon; color: string }> = {
  Ready: { icon: CheckCircle, color: "bg-chart-primary" },
  Active: { icon: Play, color: "bg-success" },
  Expired: { icon: Clock, color: "bg-warning" },
  Revoked: { icon: Ban, color: "bg-destructive" },
  Canceled: { icon: XCircle, color: "bg-destructive" },
  Returned: { icon: XCircle, color: "bg-warning" },
};

// Fallback pour les types non reconnus
const defaultConfig = { icon: Book, color: "bg-chart-primary" };

// Fonction utilitaire pour mettre la première lettre en majuscule
export const capitalizeFirstLetter = (string: string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const getPublicationTypeConfig = (typeName: string) => {
  // Recherche insensible à la casse
  const key = Object.keys(publicationTypeConfig).find(
    k => k.toLowerCase() === typeName.toLowerCase()
  );
  return key ? publicationTypeConfig[key] : defaultConfig;
};

export const getLicenseStatusConfig = (statusName: string) => {
  // Recherche insensible à la casse
  const key = Object.keys(licenseStatusConfig).find(
    k => k.toLowerCase() === statusName.toLowerCase()
  );
  return key ? licenseStatusConfig[key] : defaultConfig;
};