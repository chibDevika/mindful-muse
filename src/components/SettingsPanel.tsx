import { Settings, Volume2, Zap, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { SessionSettings } from '@/lib/session-store';

interface SettingsPanelProps {
  settings: SessionSettings;
  onSettingsChange: (settings: Partial<SessionSettings>) => void;
  className?: string;
}

// Available ElevenLabs voices
// TODO: Add your voice IDs here
const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Calm, warm female voice' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Gentle, soothing voice' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Friendly, approachable voice' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Calm male voice' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Warm, reassuring voice' },
];

export function SettingsPanel({ settings, onSettingsChange, className }: SettingsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("rounded-full", className)}>
          <Settings className="w-5 h-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[340px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your Unwind experience
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-8 mt-8">
          {/* Voice Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Label>Voice</Label>
            </div>
            <Select
              value={settings.voiceId}
              onValueChange={(value) => onSettingsChange({ voiceId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span>{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {voice.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Playback Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <Label>Playback Speed</Label>
              </div>
              <span className="text-sm text-muted-foreground">
                {settings.playbackSpeed}x
              </span>
            </div>
            <Slider
              value={[settings.playbackSpeed]}
              min={0.5}
              max={2}
              step={0.25}
              onValueChange={([value]) => onSettingsChange({ playbackSpeed: value })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1x</span>
              <span>1.5x</span>
              <span>2x</span>
            </div>
          </div>

          {/* Auto-play */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>Auto-play responses</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically play AI responses
                </p>
              </div>
            </div>
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={(checked) => onSettingsChange({ autoPlay: checked })}
            />
          </div>
        </div>

        {/* Privacy note */}
        <div className="mt-12 p-4 rounded-2xl bg-muted">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Your privacy matters.</strong>
            {' '}All conversations stay on your device and are never stored on our servers.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
