import { ServiceForm } from '@/components/ServiceForm';
import cleanpoolLogo from '@/assets/cleanpool-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Wave decoration */}
      <div className="absolute inset-x-0 top-0 h-64 gradient-wave overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <main className="relative container max-w-lg px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <img
            src={cleanpoolLogo}
            alt="Clean Pool - Seu lazer começa aqui!"
            className="h-16 md:h-20 mx-auto mb-4 animate-fade-in"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2 animate-fade-in">
            Registro de Serviço
          </h1>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Preencha os dados do serviço prestado
          </p>
        </header>

        {/* Form Card */}
        <div 
          className="bg-card rounded-xl shadow-card p-6 md:p-8 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <ServiceForm />
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p>© {new Date().getFullYear()} Clean Pool</p>
          <p className="mt-1">Manutenção profissional de piscinas</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
