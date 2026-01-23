import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Loader from "../components/loading/Loader";

interface User {
  id?: number;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  motDePasse?: string;
  createdAt?: string;
  isActive?: boolean;
}

const baseUrl = import.meta.env.VITE_API_URL;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<User>({
    nom: "",
    prenom: "",
    email: "",
    role: "SELLER",
    motDePasse: "",
  });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Utilisateur non authentifié");

      const res = await fetch(`${baseUrl}/api/utilisateurs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          text || "Erreur lors de la récupération des utilisateurs"
        );
      }

      const data: any[] = await res.json();
      const mappedUsers: User[] = data.map((u) => ({
        ...u,
        isActive: u.isActive ?? u.actif,
      }));
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nom.toLowerCase().includes(term) ||
          u.prenom?.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) =>
        statusFilter === "active" ? u.isActive : !u.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
      )
    )
      return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Utilisateur non authentifié");

      const res = await fetch(`${baseUrl}/api/utilisateurs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la suppression");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess("Utilisateur supprimé avec succès");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Utilisateur non authentifié");

      const url = editingUser?.id
        ? `${baseUrl}/api/utilisateurs/${editingUser.id}`
        : `${baseUrl}/api/utilisateurs`;
      const method = editingUser?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de l'enregistrement");
      }

      await fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "SELLER",
        motDePasse: "",
      });
      setSuccess(
        editingUser
          ? "Utilisateur modifié avec succès"
          : "Utilisateur créé avec succès"
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setTimeout(() => setError(""), 5000);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
    setShowPassword(false);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      role: "SELLER",
      motDePasse: "",
    });
    setIsModalOpen(true);
    setShowPassword(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "PRODUCTION":
        return "bg-blue-100 text-blue-800";
      case "SELLER":
        return "bg-green-100 text-green-800";
      case "BUYER":
        return "bg-yellow-100 text-yellow-800";
      case "MARKETING":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "";
      case "PRODUCTION":
        return "";
      case "SELLER":
        return "";
      case "MARKETING":
        return "";
      default:
        return "";
    }
  };

  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const exportToCSV = () => {
    const headers = "Nom,Prénom,Email,Rôle,Date de création,Statut\n";
    const csvContent = users
      .map(
        (user) =>
          `"${user.nom}","${user.prenom || ""}","${user.email}","${
            user.role
          }","${
            user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("fr-FR")
              : "N/A"
          }","${user.isActive ? "Actif" : "Inactif"}"`
      )
      .join("\n");

    const blob = new Blob([headers + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `utilisateurs_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600">
                Gérez les accès et permissions des utilisateurs
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="mt-4 md:mt-0 inline-flex items-center py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-sm hover:shadow-md"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total utilisateurs"
              value={users.length}
              icon={Users}
              color="text-blue-500"
            />
            <StatsCard
              title="Administrateurs"
              value={users.filter((u) => u.role === "ADMIN").length}
              icon={UserCheck}
              color="text-red-500"
            />
            <StatsCard
              title="Utilisateurs actifs"
              value={users.filter((u) => u.isActive).length}
              icon={UserCheck}
              color="text-green-500"
            />
            <StatsCard
              title="Utilisateurs inactifs"
              value={users.filter((u) => !u.isActive).length}
              icon={UserX}
              color="text-gray-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
              <UserCheck className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="SELLER">Vendeur</option>
                  <option value="BUYER">Client</option>
                  <option value="MARKETING">Marketing</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Exporter en CSV"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>

              <button
                onClick={fetchUsers}
                className="flex items-center px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {/* Users Table - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.nom.charAt(0)}
                          {user.prenom?.charAt(0) || ""}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {user.nom} {user.prenom}
                          </div>
                          {user.createdAt && (
                            <div className="text-sm text-gray-500">
                              Créé le{" "}
                              {new Date(user.createdAt).toLocaleDateString(
                                "fr-FR"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (shown on mobile) */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Header avec avatar et informations principales */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                      {user.nom.charAt(0)}
                      {user.prenom?.charAt(0) || ""}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">
                        {user.nom} {user.prenom}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-[160px]">
                        {user.email}
                      </p>
                      {user.createdAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Créé le{" "}
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rôle et statut */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)} {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* États vides et chargement */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader />
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Aucun utilisateur ne correspond à vos critères"
                  : "Commencez par ajouter votre premier utilisateur"}
              </p>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mot de passe"
                        value={formData.motDePasse}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            motDePasse: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="ADMIN">Administrateur</option>
                    <option value="PRODUCTION">Production</option>
                    <option value="SELLER">Vendeur</option>
                    <option value="BUYER">Client</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    {editingUser ? "Modifier" : "Créer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
