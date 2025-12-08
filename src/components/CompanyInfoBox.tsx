import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
}

interface CompanyInfoBoxProps {
  profile: CompanyProfile | null;
}

const CompanyInfoBox = ({ profile }: CompanyInfoBoxProps) => {
  if (!profile) {
    return (
      <div className="bg-muted rounded-lg p-4 border border-border">
        <p className="text-muted-foreground mb-2">Profil tvrtke nije popunjen.</p>
        <Link to="/profil">
          <Button variant="outline" size="sm">Popuni profil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-4 border border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Tvrtka:</span>
          <p className="font-medium">{profile.naziv_firme}</p>
        </div>
        <div>
          <span className="text-muted-foreground">OIB:</span>
          <p className="font-medium">{profile.oib}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Adresa:</span>
          <p className="font-medium">{profile.adresa}</p>
        </div>
        <div>
          <span className="text-muted-foreground">IBAN:</span>
          <p className="font-medium">{profile.iban || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoBox;
