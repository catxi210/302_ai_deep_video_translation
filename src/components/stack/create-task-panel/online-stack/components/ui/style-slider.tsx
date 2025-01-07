import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StyleSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
}

export const StyleSlider = ({
  label,
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
  className,
}: StyleSliderProps) => {
  const handleInputChange = (inputValue: string) => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const displayValue =
    value === undefined
      ? "0"
      : typeof value === "number" && !Number.isInteger(value)
        ? value.toFixed(1)
        : value.toString();

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-1">
        <Label className="flex-shrink-0 text-[0.7rem] text-muted-foreground">
          {label}
        </Label>
        <div className="flex items-center gap-0.5">
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="h-5 w-10 px-1 py-0 text-right font-mono text-[0.7rem]"
          />
          <span className="w-3 text-[0.7rem] text-muted-foreground">
            {unit}
          </span>
        </div>
      </div>
      <div className="px-0.5">
        <Slider
          value={[value ?? 0]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="h-2.5 py-0.5"
        />
      </div>
    </div>
  );
};
