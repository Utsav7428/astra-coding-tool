import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { useSettingsStore, type ThemeMode } from "@/store/settings.store";

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md px-2 py-2">
      <div className="min-w-0">
        <Label className="text-[13px]">{label}</Label>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function SettingsPanel() {
  const s = useSettingsStore();

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Settings" subtitle="workspace" />
      <div className="flex-1 space-y-1 overflow-auto p-2">
        <Row
          label="Theme"
          hint="Editor and UI appearance"
          control={
            <Select value={s.theme} onValueChange={(v) => s.setTheme(v as ThemeMode)}>
              <SelectTrigger className="h-8 w-28 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <Row
          label={`Font size · ${s.fontSize}px`}
          control={
            <Slider
              className="w-32"
              min={11}
              max={20}
              step={1}
              value={[s.fontSize]}
              onValueChange={([v]) => s.set("fontSize", v ?? 13)}
            />
          }
        />
        <Row
          label={`Tab size · ${s.tabSize}`}
          control={
            <Slider
              className="w-32"
              min={2}
              max={8}
              step={2}
              value={[s.tabSize]}
              onValueChange={([v]) => s.set("tabSize", v ?? 2)}
            />
          }
        />
        <Row
          label="Word wrap"
          control={
            <Switch checked={s.wordWrap} onCheckedChange={(v) => s.set("wordWrap", v)} />
          }
        />
        <Row
          label="Minimap"
          control={<Switch checked={s.minimap} onCheckedChange={(v) => s.set("minimap", v)} />}
        />
        <Row
          label="Terminal auto-scroll"
          control={
            <Switch
              checked={s.autoScrollTerminal}
              onCheckedChange={(v) => s.set("autoScrollTerminal", v)}
            />
          }
        />

        <div className="mt-4 rounded-lg border border-border bg-surface p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Backend endpoints
          </p>
          <ul className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
            <li>GET /api/workspaces/current/tree</li>
            <li>GET /api/files/{"{id}"}</li>
            <li>PUT /api/files/{"{id}"}</li>
            <li>POST /api/chat</li>
            <li>GET /api/chat/history</li>
            <li>ws://localhost:8080/ws/terminal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}