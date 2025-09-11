export const exportToCSV = (data: any[], filename: string) => {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: any[], title: string) => {
  // Implémentation simplifiée - utiliser une librairie comme jsPDF pour une solution complète
  alert(`Fonctionnalité PDF en cours de développement pour: ${title}`);
  console.log("Export PDF:", title, data);

  // Pour une implémentation réelle, utiliser:
  // import jsPDF from 'jspdf';
  // import 'jspdf-autotable';
};
