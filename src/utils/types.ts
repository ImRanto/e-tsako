export interface Stock {
  id: number;
  nomMatiere: string;
  quantite: number;
  unite: string;
  seuilAlerte: number;
}

export interface CommandeDetail {
  id: number;
  produit: {
    id: number;
    nom: string;
    prixUnitaire: number;
    categorie: string;
    stockDisponible: number;
  };
  quantite: number;
  prixTotal: number;
}

export interface Commande {
  id: number;
  client: {
    id: number;
    nom: string;
    typeClient: string;
    telephone: string;
    email: string;
    adresse: string;
  };
  dateCommande: string;
  statut: "PAYEE" | "EN_ATTENTE" | "LIVREE";
  details: CommandeDetail[];
  createdBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  };
  updatedBy: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
  };
}

export interface PagedResponse {
  content: Commande[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Stats {
  clientsActifs: number;
  produitsEnStock: number;
  chiffreAffaires: number;
  totalCommandes: number;
}

export interface ActivationKey {
  id: number;
  keyValue: string;
  createdAt: string;
  used: boolean;
  expiresAt?: string;
  usedBy?: string;
  usedAt?: string;
}
