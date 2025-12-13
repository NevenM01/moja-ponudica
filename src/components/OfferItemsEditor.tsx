import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';

interface OfferItem {
  id: string;
  opis: string;
  kolicina: number;
  cijena: number;
  ukupno: number;
  is_optional?: boolean;
}

interface OfferItemsEditorProps {
  items: OfferItem[];
  onUpdateItem: (id: string, field: keyof OfferItem, value: string | number | boolean) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  total: number;
}

const OfferItemsEditor = ({
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  total,
}: OfferItemsEditorProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Label>Stavke ponude</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Dodaj stavku</span>
          <span className="sm:hidden">Dodaj</span>
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Opis</TableHead>
              <TableHead>Količina</TableHead>
              <TableHead>Cijena (€)</TableHead>
              <TableHead>Ukupno (€)</TableHead>
              <TableHead className="w-24 text-center">Opcijski</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    value={item.opis}
                    onChange={(e) => onUpdateItem(item.id, 'opis', e.target.value)}
                    placeholder="Opis stavke"
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.kolicina}
                    onChange={(e) => onUpdateItem(item.id, 'kolicina', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.cijena}
                    onChange={(e) => onUpdateItem(item.id, 'cijena', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.ukupno.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={item.is_optional || false}
                    onCheckedChange={(checked) => onUpdateItem(item.id, 'is_optional', !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border border-border rounded-lg p-3 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Stavka {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(item.id)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Opis</Label>
              <Input
                value={item.opis}
                onChange={(e) => onUpdateItem(item.id, 'opis', e.target.value)}
                placeholder="Opis stavke"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Količina</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.kolicina}
                  onChange={(e) => onUpdateItem(item.id, 'kolicina', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cijena (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.cijena}
                  onChange={(e) => onUpdateItem(item.id, 'cijena', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`optional-${item.id}`}
                  checked={item.is_optional || false}
                  onCheckedChange={(checked) => onUpdateItem(item.id, 'is_optional', !!checked)}
                />
                <Label htmlFor={`optional-${item.id}`} className="text-xs text-muted-foreground">
                  Opcijski
                </Label>
              </div>
              <span className="font-bold text-primary">{item.ukupno.toFixed(2)} €</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <div className="text-lg md:text-xl font-bold">Ukupno: {total.toFixed(2)} €</div>
      </div>
    </div>
  );
};

export default OfferItemsEditor;
