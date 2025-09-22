export interface Client {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER";
  telephone: string;
  email: string;
  adresse: string;
}

export interface Produit {
  id: number;
  nom: string;
  prixUnitaire: number;
  categorie: "CHIPS" | "SNACK" | "AUTRE";
  stockDisponible: number;
}

export interface DetailCommande {
  id: number;
  produit: Produit;
  quantite: number;
  prixTotal: number;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  role: string;
  email: string;
}

export interface Commande {
  id: number;
  client: Client;
  dateCommande: string;
  statut: "EN_ATTENTE" | "PAYEE" | "LIVREE" | "ANNULEE" | "ACCEPTE";
  details: DetailCommande[];
  createdBy: Utilisateur;
  updatedBy: Utilisateur | null;
}

export interface ApiResponse {
  content: Commande[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
