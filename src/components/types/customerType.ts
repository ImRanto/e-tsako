export interface Customer {
  id: number;
  nom: string;
  typeClient: "EPICERIE" | "PARTICULIER" | "RESTAURANT";
  telephone: string;
  email: string;
  adresse: string;
}
