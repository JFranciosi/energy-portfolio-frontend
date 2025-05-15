
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DataFiltersProps {
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  onGranularityChange?: (granularity: string) => void;
  onExport?: () => void;
  className?: string;
}

export const DataFilters = ({
  onDateRangeChange,
  onGranularityChange,
  onExport,
  className
}: DataFiltersProps) => {
  const [date, setDate] = React.useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });

  React.useEffect(() => {
    if (date.from && date.to && onDateRangeChange) {
      onDateRangeChange(date);
    }
  }, [date, onDateRangeChange]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {date.from && date.to
                ? `${format(date.from, 'dd MMM yyyy', { locale: it })} - ${format(
                    date.to,
                    'dd MMM yyyy',
                    { locale: it }
                  )}`
                : 'Seleziona periodo'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from}
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate as { from: Date; to: Date })}
            numberOfMonths={2}
            locale={it}
          />
        </PopoverContent>
      </Popover>

      <Select onValueChange={onGranularityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Granularità" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Giornaliera</SelectItem>
          <SelectItem value="weekly">Settimanale</SelectItem>
          <SelectItem value="monthly">Mensile</SelectItem>
          <SelectItem value="quarterly">Trimestrale</SelectItem>
          <SelectItem value="yearly">Annuale</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Esporta
        </Button>
      </div>
    </div>
  );
};
