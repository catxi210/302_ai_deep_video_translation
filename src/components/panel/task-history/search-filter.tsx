import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  CalendarIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ManagedTask } from "@/types/task-manager";
import { TaskFilter, TaskSort } from "@/hooks/dexie/use-task-history";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay } from "date-fns";
import { zhCN, enUS, ja } from "date-fns/locale";
import { GloablTaskStatus } from "@/stores";

interface SearchFilterProps {
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
}

const getLocale = (locale: string) => {
  switch (locale) {
    case "zh":
      return zhCN;
    case "en":
      return enUS;
    case "ja":
      return ja;
    default:
      return enUS;
  }
};

export const SearchFilter = ({
  onFilterChange,
  onSortChange,
}: SearchFilterProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<GloablTaskStatus[]>(
    []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<{
    source?: string;
    target?: string;
  }>({});
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const [sort, setSort] = useState<TaskSort>({
    field: "createdAt",
    direction: "desc",
  });

  const updateFilter = useCallback(() => {
    const filter: TaskFilter = {};
    if (searchQuery) filter.search = searchQuery;
    if (selectedStatuses.length) filter.status = selectedStatuses;
    if (selectedLanguages.source)
      filter.sourceLanguage = selectedLanguages.source;
    if (selectedLanguages.target)
      filter.targetLanguage = selectedLanguages.target;
    if (dateRange.start && dateRange.end) {
      filter.dateRange = {
        start: startOfDay(dateRange.start),
        end: endOfDay(dateRange.end),
      };
    }
    onFilterChange(filter);
  }, [
    searchQuery,
    selectedStatuses,
    selectedLanguages,
    dateRange,
    onFilterChange,
  ]);

  useEffect(() => {
    updateFilter();
  }, [updateFilter]);

  useEffect(() => {
    onSortChange(sort);
  }, [sort, onSortChange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setSelectedLanguages({});
    setDateRange({});
  };

  const toggleSort = (field: keyof ManagedTask) => {
    setSort((prevSort) => ({
      field,
      direction:
        prevSort.field === field && prevSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  return (
    <div className="border-b px-3 py-2">
      <div className="flex flex-col gap-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
            placeholder={t("task.search_placeholder")}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Filter and Sort */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5",
                  (selectedStatuses.length > 0 ||
                    selectedLanguages.source ||
                    selectedLanguages.target ||
                    dateRange.start) &&
                    "bg-accent"
                )}
              >
                <Filter className="size-3.5" />
                {t("task.filter")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("task.filter_status")}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(
                      ["pending", "processing", "completed", "failed"] as const
                    ).map((status) => (
                      <Button
                        key={status}
                        variant={
                          selectedStatuses.includes(status)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedStatuses((prev) =>
                            prev.includes(status)
                              ? prev.filter((s) => s !== status)
                              : [...prev, status]
                          );
                        }}
                      >
                        {t(`task.status.${status}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Language Filter */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    {t("task.filter_language")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={selectedLanguages.source}
                      onValueChange={(value) =>
                        setSelectedLanguages((prev) => ({
                          ...prev,
                          source: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "form.fields.sourceLanguage.placeholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {["auto", "zh", "en", "ja"].map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {t(`form.fields.language.${lang}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedLanguages.target}
                      onValueChange={(value) =>
                        setSelectedLanguages((prev) => ({
                          ...prev,
                          target: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "form.fields.targetLanguage.placeholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {["zh", "en", "ja"].map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {t(`form.fields.language.${lang}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("task.filter_date")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        {t("task.date_from")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.start && "text-muted-foreground"
                            )}
                          >
                            {dateRange.start ? (
                              format(dateRange.start, "PPP", {
                                locale: getLocale(locale),
                              })
                            ) : (
                              <span>{t("task.select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.start}
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                start: date,
                              }))
                            }
                            locale={getLocale(locale)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        {t("task.date_to")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.end && "text-muted-foreground"
                            )}
                          >
                            {dateRange.end ? (
                              format(dateRange.end, "PPP", {
                                locale: getLocale(locale),
                              })
                            ) : (
                              <span>{t("task.select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.end}
                            onSelect={(date) =>
                              setDateRange((prev) => ({
                                ...prev,
                                end: date,
                              }))
                            }
                            initialFocus
                            locale={getLocale(locale)}
                            disabled={(date) =>
                              dateRange.start ? date < dateRange.start : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearFilters}
                >
                  {t("task.clear_filters")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort */}
          <div className="flex flex-1 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => toggleSort("createdAt")}
            >
              {t("task.created_at")}
              {sort.field === "createdAt" &&
                (sort.direction === "asc" ? (
                  <SortAsc className="ml-1 size-3.5" />
                ) : (
                  <SortDesc className="ml-1 size-3.5" />
                ))}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => toggleSort("updatedAt")}
            >
              {t("task.updated_at")}
              {sort.field === "updatedAt" &&
                (sort.direction === "asc" ? (
                  <SortAsc className="ml-1 size-3.5" />
                ) : (
                  <SortDesc className="ml-1 size-3.5" />
                ))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
