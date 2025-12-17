import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FolderPlus, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface OfferItem {
  id: string;
  opis: string;
  jedinica: string;
  kolicina: number;
  cijena: number;
  ukupno: number;
  is_optional?: boolean;
  group_id?: string;
}

export interface OfferGroup {
  id: string;
  naziv: string;
  opis?: string;
  redni_broj: number;
  items: OfferItem[];
}

interface OfferItemsEditorProps {
  groups: OfferGroup[];
  onUpdateGroup: (groupId: string, field: 'naziv' | 'opis', value: string) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateItem: (groupId: string, itemId: string, field: keyof OfferItem, value: string | number | boolean) => void;
  onAddItem: (groupId: string) => void;
  onRemoveItem: (groupId: string, itemId: string) => void;
  onMoveItem: (groupId: string, itemId: string, direction: 'up' | 'down') => void;
  total: number;
}

const UNIT_OPTIONS = [
  { value: 'kom', label: 'kom' },
  { value: 'sat', label: 'sat' },
  { value: 'm', label: 'm' },
  { value: 'm2', label: 'm²' },
  { value: 'm3', label: 'm³' },
  { value: 'kg', label: 'kg' },
  { value: 'l', label: 'l' },
  { value: 'paušal', label: 'paušal' },
];

const OfferItemsEditor = ({
  groups,
  onUpdateGroup,
  onAddGroup,
  onRemoveGroup,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  total,
}: OfferItemsEditorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Stavke ponude</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddGroup}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Dodaj grupu
        </Button>
      </div>

      {groups.map((group) => (
        <Card key={group.id} className="border-border">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">{group.redni_broj}.</span>
              <Input
                value={group.naziv}
                onChange={(e) => onUpdateGroup(group.id, 'naziv', e.target.value)}
                placeholder="Naziv grupe (npr. FILTRACIJA I CIRKULACIJA)"
                className="flex-1 font-semibold"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveGroup(group.id)}
                disabled={groups.length === 1}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={group.opis || ''}
              onChange={(e) => onUpdateGroup(group.id, 'opis', e.target.value)}
              placeholder="Opis grupe (opcionalno)"
              className="mt-2 text-sm"
            />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-muted-foreground px-1">
                <div className="col-span-1">Br.</div>
                <div className="col-span-3">Naziv</div>
                <div className="col-span-1">Jed</div>
                <div className="col-span-2">Kol</div>
                <div className="col-span-2">Jed cijena</div>
                <div className="col-span-2">Ukupno</div>
                <div className="col-span-1"></div>
              </div>
              {group.items.map((item, itemIndex) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                  <div className="col-span-1 flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">{group.redni_broj}.{itemIndex + 1}</span>
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onMoveItem(group.id, item.id, 'up')}
                        disabled={itemIndex === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onMoveItem(group.id, item.id, 'down')}
                        disabled={itemIndex === group.items.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={item.opis}
                      onChange={(e) => onUpdateItem(group.id, item.id, 'opis', e.target.value)}
                      placeholder="Naziv stavke"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Select
                      value={item.jedinica}
                      onValueChange={(value) => onUpdateItem(group.id, item.id, 'jedinica', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-md z-50">
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.kolicina}
                      onChange={(e) => onUpdateItem(group.id, item.id, 'kolicina', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.cijena}
                      onChange={(e) => onUpdateItem(group.id, item.id, 'cijena', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-medium text-sm">{item.ukupno.toFixed(2)} €</span>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`opt-${item.id}`}
                        checked={item.is_optional || false}
                        onCheckedChange={(checked) => onUpdateItem(group.id, item.id, 'is_optional', !!checked)}
                      />
                      <Label htmlFor={`opt-${item.id}`} className="text-xs text-muted-foreground">Opc</Label>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(group.id, item.id)}
                      disabled={group.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {group.items.map((item, index) => (
                <div key={item.id} className="border border-border rounded-lg p-3 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Stavka {group.redni_broj}.{index + 1}</span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onMoveItem(group.id, item.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onMoveItem(group.id, item.id, 'down')}
                          disabled={index === group.items.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(group.id, item.id)}
                      disabled={group.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Naziv</Label>
                    <Input
                      value={item.opis}
                      onChange={(e) => onUpdateItem(group.id, item.id, 'opis', e.target.value)}
                      placeholder="Naziv stavke"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Jedinica</Label>
                      <Select
                        value={item.jedinica}
                        onValueChange={(value) => onUpdateItem(group.id, item.id, 'jedinica', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border shadow-md z-50">
                          {UNIT_OPTIONS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Količina</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.kolicina}
                        onChange={(e) => onUpdateItem(group.id, item.id, 'kolicina', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cijena (€)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cijena}
                        onChange={(e) => onUpdateItem(group.id, item.id, 'cijena', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`optional-${item.id}`}
                        checked={item.is_optional || false}
                        onCheckedChange={(checked) => onUpdateItem(group.id, item.id, 'is_optional', !!checked)}
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

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAddItem(group.id)}
              className="mt-2 w-full border border-dashed border-border hover:border-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj stavku
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end mt-4 pt-4 border-t border-border">
        <div className="text-lg md:text-xl font-bold">Ukupno: {total.toFixed(2)} €</div>
      </div>
    </div>
  );
};

export default OfferItemsEditor;
