import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { ServiceType } from './types';
import { RoleSwitcher } from './components/navigation/RoleSwitcher';
import { Navbar } from './components/navigation/Navbar';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useDragScroll } from './hooks/useDragScroll';
import { useScrollReveal } from './hooks/useScrollReveal';
import { ThemeToggle } from './components/common/ThemeToggle';
import { Footer } from './components/navigation/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { ServicePillarsSection } from './components/landing/ServicePillarsSection';
import { ProductShowcaseSection } from './components/landing/ProductShowcaseSection';
import { CoordinationModelSection } from './components/landing/CoordinationModelSection';
import { ArtisanNetworkSection } from './components/landing/ArtisanNetworkSection';
import { FinalCtaSection } from './components/landing/FinalCtaSection';
import { RequestCreateModal } from './components/landing/RequestCreateModal';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { ArtisanDashboard } from './components/artisan/ArtisanDashboard';

function AppContent() {
  const { 
    currentRole, 
    setCurrentRole, 
    createRequest, 
    preloadScenario, 
    resetAllData 
  } = useApp();

  useScrollReveal(currentRole === 'guest', 'landing');
  useScrollReveal(currentRole !== 'guest', 'dashboard');
  useDragScroll();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalInitialService, setModalInitialService] = useState<ServiceType>('gifts');

  const lockSpy = useScrollSpy(currentRole === 'guest', setActiveTab);

  const handleNavigateTab = (tab: string) => {
    lockSpy();
    setActiveTab(tab);

    if (tab === 'my-orders') {
      setCurrentRole('customer');
      setSelectedRequestId(undefined);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentRole !== 'guest') {
      setCurrentRole('guest');
    }
    
    setTimeout(() => {
      if (tab === 'workshop') {
        const el = document.getElementById('service-workshop') || document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'gifts') {
        const el = document.getElementById('service-gifts') || document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'about' || tab === 'artisans') {
        const el = document.getElementById('artisans');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'model') {
        const el = document.getElementById('coordination-model');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const handleOpenCreateRequest = (service?: ServiceType) => {
    if (service) setModalInitialService(service);
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreateRequest = (formData: any) => {
    const newReq = createRequest(formData);
    setIsCreateModalOpen(false);
    setSelectedRequestId(newReq.id);
    setCurrentRole('customer');
    setActiveTab('my-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScenario = (scenarioId: string) => {
    preloadScenario(scenarioId);
    if (scenarioId === 'scen-an-nam') {
      setSelectedRequestId('YC-2601');
      setActiveTab('my-orders');
    } else if (scenarioId === 'scen-sao-mai') {
      setSelectedRequestId('YC-2602');
      setActiveTab('my-orders');
    } else if (scenarioId === 'scen-artisan') {
      setSelectedRequestId(undefined);
    }
  };

  const handleResetDemo = () => {
    resetAllData();
    setSelectedRequestId(undefined);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-[#1d1d1f]">
      {/* 1. Only show Customer Navbar when in Guest or Customer mode */}
      {(currentRole === 'guest' || currentRole === 'customer') && (
        <Navbar
          currentRole={currentRole}
          onNavigateTab={handleNavigateTab}
          onOpenQuickRequest={handleOpenCreateRequest}
          activeTab={activeTab}
        />
      )}

      {/* 2. Main Content Routing */}
      <main className="flex-1">
        {/* Guest View: Landing Page */}
        {currentRole === 'guest' && (
          <>
            <HeroSection
              onSelectService={(service) => handleNavigateTab(service)}
              onOpenQuickRequest={handleOpenCreateRequest}
            />
            <ServicePillarsSection
              onSelectService={(service) => handleOpenCreateRequest(service)}
              onOpenQuickRequest={handleOpenCreateRequest}
            />
            <ProductShowcaseSection
              onOpenQuickRequest={handleOpenCreateRequest}
            />
            <CoordinationModelSection
              onOpenQuickRequest={() => handleOpenCreateRequest('gifts')}
            />
            <ArtisanNetworkSection />
            <FinalCtaSection
              onOpenQuickRequest={handleOpenCreateRequest}
            />
          </>
        )}

        {/* Customer Portal View: My Orders & Tracking */}
        {currentRole === 'customer' && (
          <CustomerDashboard
            onOpenCreateModal={() => handleOpenCreateRequest('gifts')}
            selectedRequestId={selectedRequestId}
          />
        )}

        {/* Owner Coordinator Portal View */}
        {currentRole === 'owner' && (
          <OwnerDashboard
            onBackToClientSite={() => {
              setCurrentRole('guest');
              setActiveTab('home');
            }}
          />
        )}

        {/* Artisan View: Dedicated Workshop Management Workspace */}
        {currentRole === 'artisan' && (
          <ArtisanDashboard
            onBackToClientSite={() => {
              setCurrentRole('guest');
              setActiveTab('home');
            }}
          />
        )}
      </main>

      {/* 3. Footer only on client-facing views */}
      {(currentRole === 'guest' || currentRole === 'customer') && (
        <Footer onNavigateTab={handleNavigateTab} />
      )}

      <ThemeToggle />

      {/* 4. Compact Floating Demo Role Switcher Tool */}
      <RoleSwitcher
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'guest') setSelectedRequestId(undefined);
        }}
        onSelectScenario={handleSelectScenario}
        onResetDemo={handleResetDemo}
      />

      {/* 5. Request Creation Modal with Validation & Review Step */}
      <RequestCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialService={modalInitialService}
        onSubmit={handleSubmitCreateRequest}
      />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
