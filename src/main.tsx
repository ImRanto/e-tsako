import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import PageWrapper from "./components/PageWrapper.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageWrapper>
              <App />
            </PageWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <ContactPage />
            </PageWrapper>
          }
        />
        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFoundPage />
            </PageWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
