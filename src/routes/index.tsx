import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Campaigns from '../pages/Campaigns';
import CampaignDetails from '../pages/CampaignDetails';
import Leads from '../pages/Leads';
import LeadDetails from '../pages/LeadDetails';
import ContactEvents from '../pages/ContactEvents';
import Settings from '../pages/Settings';
import Playbooks from '../pages/Playbooks';
import PlaybookBuilder from '../pages/PlaybookBuilder';
import KnowledgeBase from '../pages/KnowledgeBase';
import DealRoom from '../pages/DealRoom';
import AIActionLog from '../pages/AIActionLog';
import Assets from '../pages/Assets';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/:id" element={<CampaignDetails />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/leads/:id" element={<LeadDetails />} />
      <Route path="/contact-events" element={<ContactEvents />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/playbooks" element={<Playbooks />} />
      <Route path="/playbooks/:id" element={<PlaybookBuilder />} />
      <Route path="/knowledge-base" element={<KnowledgeBase />} />
      <Route path="/deals/:id" element={<DealRoom />} />
      <Route path="/ai-actions" element={<AIActionLog />} />
      <Route path="/assets" element={<Assets />} />
    </Routes>
  );
}