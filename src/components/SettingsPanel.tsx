import { Settings, Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
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
  { id: 'ixW16lrB2mGXfoaYggBt', name: 'Arfa', description: 'Indian, calm and conversational voice' },
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Gentle, soothing voice' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Friendly, approachable voice' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Calm male voice' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Warm, reassuring voice' },
];

export function SettingsPanel({ settings, onSettingsChange, className }: SettingsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full bg-primary/15 text-primary hover:bg-accent hover:text-accent-foreground transition-colors",
            className
          )}
        >
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
              <SelectTrigger className="h-auto py-3 items-start">
                <div className="flex flex-col items-start text-left w-full pr-6">
                  {(() => {
                    const selectedVoice = VOICES.find(v => v.id === settings.voiceId);
                    if (!selectedVoice) {
                      return <span className="text-muted-foreground">Select a voice</span>;
                    }
                    return (
                      <>
                        <span className="font-medium">{selectedVoice.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedVoice.description}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {voice.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
