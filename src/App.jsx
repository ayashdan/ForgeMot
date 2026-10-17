import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectLayout from "./pages/ProjectLayout";
import ProjectOverview from "./pages/ProjectOverview";
import ProjectEdit from "./pages/ProjectEdit";
import Tasks from "./pages/tabs/Tasks";
import Design from "./pages/tabs/Design";
import Measurements from "./pages/tabs/Measurements";
import Materials from "./pages/tabs/Materials";
import Subs from "./pages/tabs/Subs";
import Payments from "./pages/tabs/Payments";
import ChangeOrders from "./pages/tabs/ChangeOrders";
import TradeScope from "./pages/tabs/TradeScope";
import PunchList from "./pages/tabs/PunchList";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<ProjectOverview />} />
            <Route path="edit" element={<ProjectEdit />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="design" element={<Design />} />
            <Route path="measurements" element={<Measurements />} />
            <Route path="materials" element={<Materials />} />
            <Route path="subs" element={<Subs />} />
            <Route path="payments" element={<Payments />} />
            <Route path="change-orders" element={<ChangeOrders />} />
            <Route path="scope" element={<TradeScope />} />
            <Route path="punch-list" element={<PunchList />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
