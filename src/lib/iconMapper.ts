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
  Canceled: { icon: XCircle, color: "bg-chart-secondary" },
};

// Fallback pour les types non reconnus
const defaultConfig = { icon: Book, color: "bg-chart-primary" };

export const getPublicationTypeConfig = (typeName: string) => {
  return publicationTypeConfig[typeName] || defaultConfig;
};

export const getLicenseStatusConfig = (statusName: string) => {
  return licenseStatusConfig[statusName] || defaultConfig;
};