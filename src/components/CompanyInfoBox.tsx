import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { getDisplayDomain, getFacebookDisplayLine, getInstagramDisplayLine } from '@/lib/companyProfileDisplay';

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
  web_link?: string | null;
  instagram_link?: string | null;
  social_display_label?: string | null;
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

  const instagramLine = getInstagramDisplayLine(profile.instagram_link);
  const facebookLine = getFacebookDisplayLine(profile);

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
      {(profile.web_link || instagramLine || facebookLine) && (
        <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
          {profile.web_link && (
            <a href={profile.web_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Globe className="h-3.5 w-3.5" />
              {getDisplayDomain(profile.web_link)}
            </a>
          )}
          {instagramLine && (
            <span className="text-sm text-muted-foreground">{instagramLine}</span>
          )}
          {facebookLine && (
            <span className="text-sm text-muted-foreground">{facebookLine}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyInfoBox;
