import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { assColorToCss, cssColorToAss } from "@/utils/color";

interface ColorPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

export const ColorPicker = ({
  label,
  value = "&H000000",
  onChange,
  className,
  defaultValue = "&H000000",
}: ColorPickerProps) => {
  const currentValue = value || defaultValue;
  const cssColor = assColorToCss(currentValue);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    onChange(cssColorToAss(hex));
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <Label className="text-[0.7rem] text-muted-foreground">{label}</Label>
      )}
      <div className="group relative flex h-5 items-center gap-1">
        <div className="relative flex-shrink-0">
          <div
            className="size-5 overflow-hidden rounded-[0.1875rem] border shadow-sm hover:shadow-md group-hover:border-primary/50 motion-safe:transition-colors"
            style={{ backgroundColor: cssColor }}
          >
            <input
              type="color"
              value={cssColor}
              onChange={handleColorPickerChange}
              className="absolute -inset-1 size-7 cursor-pointer opacity-0"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 backdrop-brightness-125 group-hover:opacity-100 motion-safe:transition-opacity">
              <Palette className="size-3 text-white mix-blend-difference" />
            </div>
          </div>
        </div>
        <Input
          type="text"
          value={currentValue.toUpperCase()}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            if (/^&H[0-9A-F]{6}([0-9A-F]{2})?$/.test(value)) {
              onChange(value);
            }
          }}
          className="h-full w-[5.5rem] px-1.5 py-0 font-mono text-[0.7rem] uppercase group-hover:border-primary/50 motion-safe:transition-colors"
          maxLength={10}
        />
      </div>
    </div>
  );
};
